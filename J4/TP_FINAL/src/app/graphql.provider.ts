import { inject } from '@angular/core';
import { APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache } from '@apollo/client/core';
import { environment } from '../environments/environment';

export function provideApollo() {
  return {
    provide: APOLLO_OPTIONS,
    useFactory: () => {
      const httpLink = inject(HttpLink);
      return {
        link: httpLink.create({ uri: environment.graphqlUrl }),
        cache: new InMemoryCache(),
      };
    },
  };
}
