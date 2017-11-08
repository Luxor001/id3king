module.exports = class BaseResult {
   constructor() {
     this.Return = false;
   }
   setError(error, errorData){
      this.error = error;
      this.errorData = errorData;
      return this;
   }
}
