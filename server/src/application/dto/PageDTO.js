class PageDTO {
  static from(page) {
    if (!page) {
      return null;
    }

    const dto = {
      id: page.id ?? null,
      title: page.title ?? '',
      slug: page.slug ?? null,
    };

    if (Object.prototype.hasOwnProperty.call(page, 'content')) {
      dto.content = page.content ?? '';
    }

    if (Object.prototype.hasOwnProperty.call(page, 'published')) {
      dto.published = Boolean(page.published);
    }

    if (Object.prototype.hasOwnProperty.call(page, 'show_in')) {
      dto.show_in = page.show_in ?? 'none';
    }

    if (Object.prototype.hasOwnProperty.call(page, 'version')) {
      dto.version = Number(page.version ?? 1);
    }

    return dto;
  }
}

module.exports = {
  PageDTO,
};
