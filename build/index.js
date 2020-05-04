"use strict";

var _graphqlSchema = require("./graphql-schema");

var _apolloServerExpress = require("apollo-server-express");

var _express = require("express");

var _express2 = _interopRequireDefault(_express);

var _neo4jDriver = require("neo4j-driver");

var _neo4jGraphqlJs = require("neo4j-graphql-js");

var _dotenv = require("dotenv");

var _dotenv2 = _interopRequireDefault(_dotenv);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// establecer variables de entorno desde ../.env
_dotenv2.default.config();

var app = (0, _express2.default)();

/*
 * Crear un objeto de esquema GraphQL ejecutable a partir de definiciones de tipo GraphQL
 * Incluyendo consultas autogeneradas y mutaciones.
 */

var schema = (0, _neo4jGraphqlJs.makeAugmentedSchema)({
  typeDefs: _graphqlSchema.typeDefs
});

/*
 * Cree una instancia de controlador Neo4j para conectarse a la base de datos
 * usando credenciales especificadas como variables de entorno
 * con cambio a los valores predeterminados
 */
var driver = _neo4jDriver.v1.driver(process.env.NEO4J_URI || "bolt://localhost:7687", _neo4jDriver.v1.auth.basic(process.env.NEO4J_USER || "neo4j", process.env.NEO4J_PASSWORD || "neo4j"));

/*
 * Cree una nueva instancia de ApolloServer, que sirva el esquema GraphQL
 * creado usando makeAugmentedSchema anterior e inyectando el controlador Neo4j
 * instancia en el objeto de contexto por lo que está disponible en el
 * Resuelve generadores para conectarse a la base de datos.
 */
var server = new _apolloServerExpress.ApolloServer({
  context: { driver: driver },
  schema: schema,
  introspection: true,
  playground: true
});

// Especifique el puerto y la ruta para el punto final de GraphQL
var port = process.env.GRAPHQL_LISTEN_PORT || 4001;
var path = "/graphql";

/*
* Opcionalmente, aplique el middleware Express para la autenticación, etc.
* Esto también nos permite especificar una ruta para el punto final GraphQL
*/
server.applyMiddleware({ app: app, path: path });

app.listen({ port: port, path: path }, function () {
  console.log("GraphQL server ready at http://localhost:" + port + path);
});