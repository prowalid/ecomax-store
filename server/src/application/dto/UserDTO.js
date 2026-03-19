class UserDTO {
  static from(user) {
    if (!user) {
      return null;
    }

    return {
      id: user.id ?? null,
      name: user.name ?? '',
      phone: user.phone ?? null,
      email: user.email ?? null,
      role: user.role ?? 'admin',
      two_factor_enabled: Boolean(user.two_factor_enabled),
    };
  }
}

module.exports = {
  UserDTO,
};
