import { inject } from '@angular/core';
import { APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache } from '@apollo/client/core';

const uri = 'http://localhost:4000/';

export function provideApollo() {
  return {
    provide: APOLLO_OPTIONS,
    useFactory: () => {
      const httpLink = inject(HttpLink);
      return {
        link: httpLink.create({ uri }),
        cache: new InMemoryCache(),
      };
    },
  };
}
