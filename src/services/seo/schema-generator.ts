export class SchemaGenerator {
  generateSchema(type: string, data: any): Record<string, any> {
    const base = { '@context': 'https://schema.org', '@type': type };
    return { ...base, ...data };
  }

  generateOrganization(data: any): Record<string, any> {
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: data.name,
      url: data.url,
      logo: data.logo,
      description: data.description,
      foundingDate: data.foundingDate,
      founders: data.founders,
      address: data.address ? {
        '@type': 'PostalAddress',
        streetAddress: data.address.streetAddress,
        addressLocality: data.address.addressLocality,
        addressRegion: data.address.addressRegion,
        postalCode: data.address.postalCode,
        addressCountry: data.address.addressCountry,
      } : undefined,
      contactPoint: data.contactPoint ? {
        '@type': 'ContactPoint',
        telephone: data.contactPoint.telephone,
        contactType: data.contactPoint.contactType,
        email: data.contactPoint.email,
      } : undefined,
      sameAs: data.sameAs,
    };
  }

  generateLocalBusiness(data: any): Record<string, any> {
    return {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: data.name,
      image: data.image,
      url: data.url,
      telephone: data.telephone,
      email: data.email,
      priceRange: data.priceRange,
      address: data.address ? {
        '@type': 'PostalAddress',
        streetAddress: data.address.streetAddress,
        addressLocality: data.address.addressLocality,
        addressRegion: data.address.addressRegion,
        postalCode: data.address.postalCode,
        addressCountry: data.address.addressCountry,
      } : undefined,
      geo: data.geo ? {
        '@type': 'GeoCoordinates',
        latitude: data.geo.latitude,
        longitude: data.geo.longitude,
      } : undefined,
      openingHoursSpecification: data.openingHours?.map((oh: any) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: oh.dayOfWeek,
        opens: oh.opens,
        closes: oh.closes,
      })),
      aggregateRating: data.aggregateRating ? {
        '@type': 'AggregateRating',
        ratingValue: data.aggregateRating.ratingValue,
        reviewCount: data.aggregateRating.reviewCount,
      } : undefined,
    };
  }

  generateSoftwareApp(data: any): Record<string, any> {
    return {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: data.name,
      operatingSystem: data.operatingSystem ?? 'All',
      applicationCategory: data.applicationCategory,
      offers: data.offers ? {
        '@type': 'Offer',
        price: data.offers.price,
        priceCurrency: data.offers.priceCurrency ?? 'USD',
        availability: data.offers.availability ?? 'https://schema.org/InStock',
      } : undefined,
      aggregateRating: data.aggregateRating ? {
        '@type': 'AggregateRating',
        ratingValue: data.aggregateRating.ratingValue,
        ratingCount: data.aggregateRating.ratingCount,
      } : undefined,
      description: data.description,
      image: data.image,
      url: data.url,
    };
  }

  generateFAQ(questions: Array<{ q: string; a: string }>): Record<string, any> {
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: questions.map(q => ({
        '@type': 'Question',
        name: q.q,
        acceptedAnswer: { '@type': 'Answer', text: q.a },
      })),
    };
  }

  generateHowTo(steps: Array<{ name: string; text: string }>): Record<string, any> {
    return {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: steps[0]?.name ?? '',
      step: steps.map((s, i) => ({
        '@type': 'HowToStep',
        position: i + 1,
        name: s.name,
        text: s.text,
      })),
      totalTime: steps.length > 0 ? `PT${steps.length * 5}M` : undefined,
    };
  }

  generateArticle(data: any): Record<string, any> {
    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: data.headline,
      description: data.description,
      author: data.author ? {
        '@type': data.author.type ?? 'Person',
        name: data.author.name,
        url: data.author.url,
      } : undefined,
      datePublished: data.datePublished,
      dateModified: data.dateModified ?? data.datePublished,
      image: data.image,
      publisher: data.publisher ? {
        '@type': 'Organization',
        name: data.publisher.name,
        logo: data.publisher.logo ? { '@type': 'ImageObject', url: data.publisher.logo } : undefined,
      } : undefined,
      mainEntityOfPage: data.url ? { '@type': 'WebPage', '@id': data.url } : undefined,
    };
  }

  generateBlogPost(data: any): Record<string, any> {
    return {
      ...this.generateArticle(data),
      '@type': 'BlogPosting',
    };
  }

  generateBreadcrumb(items: Array<{ name: string; url: string }>): Record<string, any> {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: item.name,
        item: item.url,
      })),
    };
  }

  generateReview(data: any): Record<string, any> {
    return {
      '@context': 'https://schema.org',
      '@type': 'Review',
      itemReviewed: data.itemReviewed ? {
        '@type': data.itemReviewed.type ?? 'Product',
        name: data.itemReviewed.name,
      } : undefined,
      author: data.author ? {
        '@type': 'Person',
        name: data.author.name,
      } : undefined,
      reviewRating: data.reviewRating ? {
        '@type': 'Rating',
        ratingValue: data.reviewRating.ratingValue,
        bestRating: data.reviewRating.bestRating ?? 5,
        worstRating: data.reviewRating.worstRating ?? 1,
      } : undefined,
      datePublished: data.datePublished,
      reviewBody: data.reviewBody,
    };
  }

  generateProduct(data: any): Record<string, any> {
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: data.name,
      description: data.description,
      image: data.image,
      sku: data.sku,
      mpn: data.mpn,
      brand: data.brand ? {
        '@type': 'Brand',
        name: data.brand.name,
      } : undefined,
      offers: data.offers ? {
        '@type': 'Offer',
        url: data.url,
        priceCurrency: data.offers.priceCurrency ?? 'USD',
        price: data.offers.price,
        priceValidUntil: data.offers.priceValidUntil,
        itemCondition: data.offers.itemCondition ?? 'https://schema.org/NewCondition',
        availability: data.offers.availability ?? 'https://schema.org/InStock',
      } : undefined,
      aggregateRating: data.aggregateRating ? {
        '@type': 'AggregateRating',
        ratingValue: data.aggregateRating.ratingValue,
        reviewCount: data.aggregateRating.reviewCount,
        bestRating: data.aggregateRating.bestRating ?? 5,
      } : undefined,
    };
  }

  generateEvent(data: any): Record<string, any> {
    return {
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: data.name,
      description: data.description,
      startDate: data.startDate,
      endDate: data.endDate,
      location: data.location ? {
        '@type': data.location.type ?? 'Place',
        name: data.location.name,
        address: data.location.address ? {
          '@type': 'PostalAddress',
          streetAddress: data.location.address.streetAddress,
          addressLocality: data.location.address.addressLocality,
          addressRegion: data.location.address.addressRegion,
          postalCode: data.location.address.postalCode,
          addressCountry: data.location.address.addressCountry,
        } : undefined,
      } : undefined,
      performer: data.performer ? {
        '@type': data.performer.type ?? 'Person',
        name: data.performer.name,
      } : undefined,
      organizer: data.organizer ? {
        '@type': 'Organization',
        name: data.organizer.name,
        url: data.organizer.url,
      } : undefined,
      offers: data.offers ? {
        '@type': 'Offer',
        url: data.offers.url,
        price: data.offers.price,
        priceCurrency: data.offers.priceCurrency ?? 'USD',
        availability: data.offers.availability ?? 'https://schema.org/InStock',
        validFrom: data.offers.validFrom,
      } : undefined,
      image: data.image,
      eventStatus: data.eventStatus ?? 'https://schema.org/EventScheduled',
      eventAttendanceMode: data.eventAttendanceMode ?? 'https://schema.org/OfflineEventAttendanceMode',
    };
  }

  generateVideo(data: any): Record<string, any> {
    return {
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      name: data.name,
      description: data.description,
      thumbnailUrl: data.thumbnailUrl,
      uploadDate: data.uploadDate,
      duration: data.duration,
      contentUrl: data.contentUrl,
      embedUrl: data.embedUrl,
      interactionStatistic: data.interactionStatistic ? {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/WatchAction',
        userInteractionCount: data.interactionStatistic.viewCount,
      } : undefined,
      publisher: data.publisher ? {
        '@type': 'Organization',
        name: data.publisher.name,
        logo: data.publisher.logo ? { '@type': 'ImageObject', url: data.publisher.logo } : undefined,
      } : undefined,
    };
  }

  generatePerson(data: any): Record<string, any> {
    return {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: data.name,
      givenName: data.givenName,
      familyName: data.familyName,
      jobTitle: data.jobTitle,
      description: data.description,
      image: data.image,
      url: data.url,
      sameAs: data.sameAs,
      worksFor: data.worksFor ? {
        '@type': 'Organization',
        name: data.worksFor.name,
      } : undefined,
      alumniOf: data.alumniOf,
      birthDate: data.birthDate,
      email: data.email,
      telephone: data.telephone,
      address: data.address ? {
        '@type': 'PostalAddress',
        addressLocality: data.address.addressLocality,
        addressRegion: data.address.addressRegion,
      } : undefined,
    };
  }
}
