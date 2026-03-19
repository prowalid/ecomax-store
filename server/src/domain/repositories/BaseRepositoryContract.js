class BaseRepositoryContract {
  notImplemented(methodName) {
    throw new Error(`${this.constructor.name} must implement ${methodName}()`);
  }
}

module.exports = {
  BaseRepositoryContract,
};
