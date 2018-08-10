'use strict';

const ArgumentParser = require('argparse').ArgumentParser;

const initArgParser = (ArgParserClass) => {
  const parser = new ArgParserClass({
    version: '0.0.1',
    addHelp: true,
    description: 'generate mixins given association name'
  });
  
  parser.addArgument(
    [ '-b', '--baseModelName' ],
    { help: 'name of base model' },
  )
  
  parser.addArgument(
    [ '-a', '--associationModelName' ],
    { help: 'array of name of model of associations', nargs: '+' },
  );

  parser.addArgument(
    [ '-s', '--singular' ],
    { help: 'array of singular of alias names (the alias for association, may be same as associationModelName)', nargs: '+' }
  );
  
  parser.addArgument(
    [ '-p', '--plural' ],
    { help: 'array of plural of alias names (if n/a then use _)', nargs: '+' },
  );
  
  parser.addArgument(
    [ '-t', '--type' ],
    { help: 'array of either BelongsTo or HasMany or HasOne or BelongsToMany', nargs: '+' }
  );

  parser.addArgument(
    [ '-j', '--joinTable' ],
    { help: 'array of join table names, either JoinTableName or an join table attributes e.g. JoinTableAttributes', nargs: '+' }
  )

  return parser;
}

// FIXME: this doesn't seem to work
// const assertArgLengthsAreTheSame = (args) => {
//   ["associationModelName", "plural", "type", "joinTable"].map(k => console.log(args[k].length));
//   console.log(args.associationModelName.length === args.plural.length === args.type.length === args.joinTable.length);
//   return args.associationModelName.length === args.plural.length === args.type.length === args.joinTable.length;
// };

const addMixinsBelongsTo = (associationModelName, singular) => {
  const AssocInstance = `${associationModelName}Instance`;
  const AssocAttributes = `${associationModelName}Attributes`;
  return (
    `
    get${singular}: Sequelize.BelongsToGetAssociationMixin<${AssocInstance}>;
    set${singular}: Sequelize.BelongsToSetAssociationMixin<${AssocInstance}, ${AssocInstance}["id"]>;
    create${singular}: Sequelize.BelongsToCreateAssociationMixin<${AssocAttributes}>;
    `
  );
};

const addMixinsHasOne = (associationModelName, singular) => {
  const AssocInstance = `${associationModelName}Instance`;
  const AssocAttributes = `${associationModelName}Attributes`;
  return (
    `
    get${singular}: Sequelize.HasOneGetAssociationMixin<${AssocInstance}>;
    set${singular}: Sequelize.HasOneSetAssociationMixin<${AssocInstance}, ${AssocInstance}["id"]>;
    create${singular}: Sequelize.HasOneCreateAssociationMixin<${AssocAttributes}>;
    `
  );
};

const addMixinsHasMany = (associationModelName, singular, plural) => {
  const AssocInstance = `${associationModelName}Instance`;
  const AssocAttributes = `${associationModelName}Attributes`;
  return (
    `
    get${plural}: Sequelize.HasManyGetAssociationsMixin<${AssocInstance}>;
    set${plural}: Sequelize.HasManySetAssociationsMixin<${AssocInstance}, ${AssocInstance}["id"]>;
    add${plural}: Sequelize.HasManyAddAssociationsMixin<${AssocInstance}, ${AssocInstance}["id"]>;
    add${singular}: Sequelize.HasManyAddAssociationMixin<${AssocInstance}, ${AssocInstance}["id"]>;
    create${singular}: Sequelize.HasManyCreateAssociationMixin<${AssocAttributes}, ${AssocInstance}>;
    remove${singular}: Sequelize.HasManyRemoveAssociationMixin<${AssocInstance}, ${AssocInstance}["id"]>;
    remove${plural}: Sequelize.HasManyRemoveAssociationsMixin<${AssocInstance}, ${AssocInstance}["id"]>;
    has${singular}: Sequelize.HasManyHasAssociationMixin<${AssocInstance}, ${AssocInstance}["id"]>;
    has${plural}: Sequelize.HasManyHasAssociationsMixin<${AssocInstance}, ${AssocInstance}["id"]>;
    count${plural}: Sequelize.HasManyCountAssociationsMixin;
    `
  );
};

const addMixinsBelongsToMany = (associationModelName, singular, plural, joinTableName) => {
  const AssocInstance = `${associationModelName}Instance`;
  const AssocAttributes = `${associationModelName}Attributes`;
  const JoinTableAttributes = joinTableName[0] === '\"' || joinTableName[0] === "\'"
    ? joinTableName
    : `${joinTableName}Attributes`;

  return (
    `
    get${plural}: Sequelize.BelongsToManyGetAssociationsMixin<${AssocInstance}>;
    set${plural}: Sequelize.BelongsToManySetAssociationsMixin<${AssocInstance}, ${AssocInstance}["id"], ${JoinTableAttributes}>;
    add${plural}: Sequelize.BelongsToManyAddAssociationsMixin<${AssocInstance}, ${AssocInstance}["id"], ${JoinTableAttributes}>;
    add${singular}: Sequelize.BelongsToManyAddAssociationMixin<${AssocInstance}, ${AssocInstance}["id"], ${JoinTableAttributes}>;
    create${singular}: Sequelize.BelongsToManyCreateAssociationMixin<${AssocAttributes}, ${AssocInstance}["id"], ${JoinTableAttributes}>;
    remove${singular}: Sequelize.BelongsToManyRemoveAssociationMixin<${AssocInstance}, ${AssocInstance}["id"]>;
    remove${plural}: Sequelize.BelongsToManyRemoveAssociationsMixin<${AssocInstance}, ${AssocInstance}["id"]>;
    has${singular}: Sequelize.BelongsToManyHasAssociationMixin<${AssocInstance}, ${AssocInstance}["id"]>;
    has${plural}: Sequelize.BelongsToManyHasAssociationsMixin<${AssocInstance}, ${AssocInstance}["id"]>;
    count${plural}: Sequelize.BelongsToManyCountAssociationsMixin;
    `
  );
};

const generateInterface = ({ baseModelName, associationModelName, singular, plural, type, joinTable }) => {
  let mixinsString = '';
  for (let i = 0; i < associationModelName.length; i++) {
    if (type[i] === "BelongsTo") {
      mixinsString += addMixinsBelongsTo(associationModelName[i], singular[i]);
    } else if (type[i] === "HasOne") {
      mixinsString += addMixinsHasOne(associationModelName[i], singular[i]);
    } else if (type[i] === "HasMany") {
      mixinsString += addMixinsHasMany(associationModelName[i], singular[i], plural[i]);
    } else if (type[i] === "BelongsToMany") {
      mixinsString += addMixinsBelongsToMany(associationModelName[i], singular[i], plural[i], joinTable[i]);
    } else {
      console.error("incorrect type: ", type[i]);
      return;
    }
  }

  let interfaceString =
    `export interface ${baseModelName}Instance extends Sequelize.Instance<${baseModelName}Attributes>, ${baseModelName}Attributes {
      ${mixinsString}
  };
    `;

  return interfaceString;
};

const main = () => {
  const parser = initArgParser(ArgumentParser);
  const args = parser.parseArgs();
  const interfaceString = generateInterface(args);
  console.log(interfaceString);
}

main();
