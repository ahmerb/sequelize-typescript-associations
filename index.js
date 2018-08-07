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
    [ '-a', '--associationName' ],
    { help: 'array of name of associations', nargs: '+' },
  );
  
  parser.addArgument(
    [ '-p', '--plural' ],
    { help: 'array of plural of association names (if n/a then use _)', nargs: '+' },
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
const assertArgLengthsAreTheSame = (args) => {
  ["associationName", "plural", "type", "joinTable"].map(k => console.log(args[k].length));
  console.log(args.associationName.length === args.plural.length === args.type.length === args.joinTable.length);
  return args.associationName.length === args.plural.length === args.type.length === args.joinTable.length;
};

const addMixinsBelongsTo = (singular) => {
  const AssocInstance = `${singular}Instance`;
  const AssocAttributes = `${singular}Attributes`;
  return (
    `
    get${singular}: Sequelize.BelongsToGetAssociationMixin<${AssocInstance}>;
    set${singular}: Sequelize.BelongsToSetAssociationMixin<${AssocInstance}, ${AssocInstance}["id"]>;
    create${singular}: Sequelize.BelongsToCreateAssociationMixin<${AssocAttributes}>;
    `
  );
};

const addMixinsHasOne = (singular) => {
  const AssocInstance = `${singular}Instance`;
  const AssocAttributes = `${singular}Attributes`;
  return (
    `
    get${singular}: Sequelize.HasOneGetAssociationMixin<${AssocInstance}>;
    set${singular}: Sequelize.HasOneSetAssociationMixin<${AssocInstance}, ${AssocInstance}["id"]>;
    create${singular}: Sequelize.HasOneCreateAssociationMixin<${AssocAttributes}>;
    `
  );
};

const addMixinsHasMany = (singular, plural) => {
  const AssocInstance = `${singular}Instance`;
  const AssocAttributes = `${singular}Attributes`;
  return (
    `
    get${plural}: Sequelize.HasManyGetAssociationsMixin<${AssocInstance}>;
    set${plural}: Sequelize.HasManySetAssociationsMixin<${AssocInstance}, ${AssocInstance}["id"]>;
    add${plural}: Sequelize.HasManyAddAssociationsMixin<${AssocInstance}, ${AssocInstance}["id"]>;
    add${singular}: Sequelize.HasManyAddAssociationMixin<${AssocInstance}, ${AssocInstance}["id"]>;
    create${singular}: Sequelize.HasManyAddAssociationMixin<${AssocAttributes}>;
    remove${singular}: Sequelize.HasManyRemoveAssociationMixin<${AssocInstance}, ${AssocInstance}["id"]>;
    remove${plural}: Sequelize.HasManyRemoveAssociationsMixin<${AssocInstance}, ${AssocInstance}["id"]>;
    has${singular}: Sequelize.HasManyHasAssociationMixin<${AssocInstance}, ${AssocInstance}["id"]>;
    has${plural}: Sequelize.HasManyHasAssociationsMixin<${AssocInstance}, ${AssocInstance}["id"]>;
    count${plural}: Sequelize.HasManyCountAssociationsMixin;
    `
  );
};

const addMixinsBelongsToMany = (singular, plural, joinTableName) => {
  const AssocInstance = `${singular}Instance`;
  const AssocAttributes = `${singular}Attributes`;
  return (
    `
    get${plural}: Sequelize.HasManyGetAssociationsMixin<${AssocInstance}>;
    set${plural}: Sequelize.HasManySetAssociationsMixin<${AssocInstance}, ${AssocInstance}["id"], ${joinTableName}>;
    add${plural}: Sequelize.HasManyAddAssociationsMixin<${AssocInstance}, ${AssocInstance}["id"], ${joinTableName}>;
    add${singular}: Sequelize.HasManyAddAssociationMixin<${AssocInstance}, ${AssocInstance}["id"], ${joinTableName}>;
    create${singular}: Sequelize.HasManyAddAssociationMixin<${AssocAttributes}, ${joinTableName}>;
    remove${singular}: Sequelize.HasManyRemoveAssociationMixin<${AssocInstance}, ${AssocInstance}["id"]>;
    remove${plural}: Sequelize.HasManyRemoveAssociationsMixin<${AssocInstance}, ${AssocInstance}["id"]>;
    has${singular}: Sequelize.HasManyHasAssociationMixin<${AssocInstance}, ${AssocInstance}["id"]>;
    has${plural}: Sequelize.HasManyHasAssociationsMixin<${AssocInstance}, ${AssocInstance}["id"]>;
    count${plural}: Sequelize.HasManyCountAssociationsMixin;
    `
  );
};

const generateInterface = ({ baseModelName, associationName, plural, type, joinTable }) => {
  let mixinsString = '';
  for (let i = 0; i < associationName.length; i++) {
    if (type[i] === "BelongsTo") {
      mixinsString += addMixinsBelongsTo(associationName[i]);
    } else if (type[i] === "HasOne") {
      mixinsString += addMixinsHasOne(associationName[i]);
    } else if (type[i] === "HasMany") {
      mixinsString += addMixinsHasMany(associationName[i], plural[i]);
    } else if (type[i] === "BelongsToMany") {
      mixinsString += addMixinsBelongsToMany(associationName[i], plural[i], joinTable[i]);
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
