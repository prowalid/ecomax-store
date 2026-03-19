class EnsureStartupSchemaUseCase {
  constructor({ schemaMigrationService }) {
    this.schemaMigrationService = schemaMigrationService;
  }

  async execute() {
    await this.schemaMigrationService.runPendingMigrations();
    await this.schemaMigrationService.ensureAppearanceSettingsShape();
  }
}

module.exports = {
  EnsureStartupSchemaUseCase,
};
