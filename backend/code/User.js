module.exports = class User {
  constructor(username, lastRouteSearched, savedRoutes, savedFilters) {
    this.username = username;
    this.lastRouteSearched = lastRouteSearched;
    this.savedRoutes = savedRoutes;
    this.savedFilters = savedFilters;
  }
}
