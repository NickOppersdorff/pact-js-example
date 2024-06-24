const { Verifier } = require('@pact-foundation/pact');
const { importData, movies, server } = require('./provider')


const port = '3001';
const app = server.listen(port, () => console.log(`Listening on port ${port}...`));
 
importData();
 
const options = {
  provider: 'MoviesAPI',
  providerBaseUrl: `http://localhost:${port}`,
  pactBrokerUrl: process.env.PACT_BROKER_BASE_URL,
  pactBrokerToken: process.env.PACT_BROKER_TOKEN,
  providerVersion: '1.0.0',
  publishVerificationResult: true,
  consumerVersionTags: ['main'],
  stateHandlers: {
    'Has a movie with specific ID': (parameters) => {
      movies.getFirstMovie().id = parameters.id;
      return Promise.resolve({ description: `Movie with ID ${parameters.id} added!` });
    },
    'an existing movie exists': (parameters) => {
      movies.insertMovie(parameters.id, parameters.name, parameters.year);
      return Promise.resolve({ description: 'Movie added!' });
    },
    'a request to delete a movie that exists': (parameters) => {
      movies.insertMovie(parameters.id, parameters.name, parameters.year);
      return Promise.resolve({ description: 'Movie added!' });
    }
  },
};

const verifier = new Verifier(options);

describe('Pact Verification', () => {
  afterAll(() => {
    app.close();
  });
  test('should validate the expectations of movie-consumer', () => {
    return verifier
      .verifyProvider()
      .then(output => {
        console.log('Pact Verification Complete!');
        console.log('Result:', output);
        app.close();
      })
  });
});