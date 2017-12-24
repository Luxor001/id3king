module.exports = class Filter {
  constructor(name, filtroDislivello, filtroLunghezza, filtroDurata, filtroDifficolta, filtroLuoghi, filtroPeriodi) {
    this.name = name;
    this.filtroDislivello = filtroDislivello;
    this.filtroLunghezza = filtroLunghezza;
    this.filtroDurata = filtroDurata;
    this.filtroDifficolta = filtroDifficolta;
    this.filtroLuoghi = filtroLuoghi;
    this.filtroPeriodi = filtroPeriodi;
  }
}
