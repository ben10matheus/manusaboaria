/* Pesquisa local compartilhada. Não altera produtos nem consulta serviços externos. */
(() => {
  'use strict';

  const stopWords = new Set(('a o as os de do da dos das e com para por em no na nos nas ao aos '
    + 'um uma uns umas seu sua seus suas meu minha meus minhas que quero procuro produto produtos manu saboaria').split(' '));
  const singulars = {
    maos: 'mao', pes: 'pe', sais: 'sal', refis: 'refil', difusores: 'difusor',
    artesanais: 'artesanal', aromaticas: 'aromatico', aromatica: 'aromatico',
    aromaticos: 'aromatico', composicoes: 'composicao', flores: 'flor', cores: 'cor'
  };
  const categoryAliases = {
    sabonetes: 'sabonete banho cuidado voce',
    banho: 'banho cuidado corporal voce',
    casa: 'casa ambiente aroma aromatico decoracao',
    presentes: 'presente presentear lembranca lembrancinha'
  };
  // Termos específicos dos produtos existentes; não indexar o texto genérico de detail.
  const productAliases = {
    'difusor-200': 'aromatizador varetas mangaja',
    'refil-difusor': 'aromatizador cereja avela',
    'vela-vidro': 'laranja cravo',
    capivela: 'vela capivara',
    geleia: 'cereja avela capim limao',
    arabescos: 'kit caixa conjunto',
    'kit-cinco': 'kit conjunto',
    bucha: 'figo maracuja cerejeira',
    'escalda-grande': 'entre petalas rosas',
    'escalda-pequeno': 'calmaflor',
    espuma: 'pitanga',
    sais: 'pitanga preta',
    incenso: 'lavanda',
    liquido: 'aveia amendoas',
    'creme-maos': 'jardim secreto'
  };

  function normalize(value) {
    return String(value == null ? '' : value).normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '').toLowerCase()
      .replace(/(\d)\s*(ml|kg|g)\b/g, '$1 $2')
      .replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');
  }

  function singular(word) {
    if (singulars[word]) return singulars[word];
    return word.length > 3 && word.endsWith('s') && !word.endsWith('ss') ? word.slice(0, -1) : word;
  }

  function terms(value) {
    return Array.from(new Set(normalize(value).split(' ').filter(word => word && !stopWords.has(word)).map(singular)));
  }

  function makeRecord(product, index) {
    const fields = [
      [product.name, 120], [product.categoryLabel, 55], [product.category, 45],
      [product.description, 35], [product.size, 25],
      [categoryAliases[product.category] || '', 28], [productAliases[product.id] || '', 38],
      [Array.isArray(product.scents) ? product.scents.join(' ') : '', 38]
    ].map(([value, weight]) => ({ words: terms(value), weight }));
    return {
      product, index, key: product.id == null ? 'index:' + index : 'id:' + product.id,
      fields, name: terms(product.name).join(' ')
    };
  }

  function exactScore(word, record) {
    let best = 0;
    record.fields.forEach(field => field.words.forEach(target => {
      if (target === word) best = Math.max(best, field.weight);
      else if (word.length >= 2 && !/^\d+$/.test(word) && target.startsWith(word)) {
        best = Math.max(best, field.weight * .68);
      }
    }));
    return best;
  }

  // Damerau-Levenshtein também reconhece duas letras vizinhas trocadas.
  function distance(a, b) {
    const rows = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1));
    for (let i = 0; i <= a.length; i++) rows[i][0] = i;
    for (let j = 0; j <= b.length; j++) rows[0][j] = j;
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        rows[i][j] = Math.min(rows[i - 1][j] + 1, rows[i][j - 1] + 1,
          rows[i - 1][j - 1] + Number(a[i - 1] !== b[j - 1]));
        if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
          rows[i][j] = Math.min(rows[i][j], rows[i - 2][j - 2] + 1);
        }
      }
    }
    return rows[a.length][b.length];
  }

  function fuzzyScore(word, record) {
    const exact = exactScore(word, record);
    if (exact) return exact;
    if (word.length < 4 || /^\d+$/.test(word)) return 0;
    const limit = word.length >= 7 ? 2 : 1;
    let best = 0;
    record.fields.forEach(field => field.words.forEach(target => {
      if (target.length < 3 || /^\d+$/.test(target) || Math.abs(target.length - word.length) > limit) return;
      const edits = distance(word, target);
      if (edits <= limit && edits / Math.max(word.length, target.length) <= .29) {
        best = Math.max(best, field.weight * (.52 - edits * .08));
      }
    }));
    return best;
  }

  function relatedFamily(query) {
    const has = target => query.some(word => word === target || (word.length >= 3 && target.startsWith(word)));
    if (has('capivela') || has('capivara')) return record => record.product.id === 'capivela';
    if (has('vela')) return record => record.product.id === 'capivela' || terms(record.product.name).includes('vela');
    if (has('sabonete')) return record => terms(record.product.name).includes('sabonete') || record.product.category === 'sabonetes';
    if (has('difusor') || has('aromatizador')) return record => terms(record.product.name).includes('difusor');
    if (has('escalda')) return record => terms(record.product.name).includes('escalda');
    if (has('agua')) return record => terms(record.product.name).includes('agua');
    if (has('presente') || has('presentear') || has('kit') || has('caixa') || has('conjunto')) {
      return record => record.product.category === 'presentes';
    }
    if (has('banho') || has('cuidado') || has('voce')) {
      return record => record.product.category === 'banho' || record.product.category === 'sabonetes';
    }
    if (has('casa') || has('aroma') || has('aromatico') || has('ambiente')) return record => record.product.category === 'casa';
    return null;
  }

  function search(products, query) {
    const words = terms(query);
    if (!Array.isArray(products) || !words.length) return { matches: [], similar: [] };
    const seen = new Set();
    const records = products.filter(product => product && typeof product === 'object').map(makeRecord).filter(record => {
      if (seen.has(record.key)) return false;
      seen.add(record.key);
      return true;
    });
    const phrase = words.join(' ');
    const matches = [];
    const remaining = [];
    records.forEach(record => {
      const scores = words.map(word => exactScore(word, record));
      if (scores.every(Boolean)) {
        let score = scores.reduce((sum, value) => sum + value, 0);
        if (record.name === phrase) score += 240;
        else if (record.name.includes(phrase)) score += 120;
        matches.push({ record, score });
      } else remaining.push(record);
    });
    const related = relatedFamily(words);
    // Uma palavra sem relação com o catálogo impede recomendações de categoria.
    const allWordsKnown = related && words.every(word => records.some(record => fuzzyScore(word, record) > 0));
    const similar = [];
    remaining.forEach(record => {
      const scores = words.map(word => fuzzyScore(word, record));
      if (scores.every(Boolean)) {
        similar.push({ record, score: scores.reduce((sum, value) => sum + value, 0) + 80 });
      } else if (allWordsKnown && related(record)) {
        similar.push({ record, score: scores.reduce((sum, value) => sum + value, 0) });
      }
    });
    const ordered = list => list.sort((a, b) => b.score - a.score || a.record.index - b.record.index).map(item => item.record.product);
    return { matches: ordered(matches), similar: ordered(similar).slice(0, 6) };
  }

  window.ManuSearch = { normalize, search };
})();
