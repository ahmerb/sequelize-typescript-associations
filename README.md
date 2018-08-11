# sequelize-typescript-associations

Generate ModelInstance interfaces for your sequelize models. The ModelInstance interface should include type definitions (using Sequelize mixins) for all functions for working with associations.

## Usage

```shell
$ yarn dev -b User -a Collection Collection Image Image User -s AssignerCollection AssigneeCollection ProfilePhoto ImageCreated InvitedBy -p AssignerCollections AssigneeCollections _ ImagesCreated _ -t HasMany BelongsToMany BelongsTo HasMany BelongsTo -j _ CollectionAssignee _ _ _
```

This will generate the following interface:

```typescript
export interface UserInstance extends Sequelize.Instance<UserAttributes>, UserAttributes {
    getAssignerCollections: Sequelize.HasManyGetAssociationsMixin<CollectionInstance>;
    setAssignerCollections: Sequelize.HasManySetAssociationsMixin<CollectionInstance, CollectionInstance["id"]>;
    addAssignerCollections: Sequelize.HasManyAddAssociationsMixin<CollectionInstance, CollectionInstance["id"]>;
    addAssignerCollection: Sequelize.HasManyAddAssociationMixin<CollectionInstance, CollectionInstance["id"]>;
    createAssignerCollection: Sequelize.HasManyCreateAssociationMixin<CollectionAttributes, CollectionInstance>;
    removeAssignerCollection: Sequelize.HasManyRemoveAssociationMixin<CollectionInstance, CollectionInstance["id"]>;
    removeAssignerCollections: Sequelize.HasManyRemoveAssociationsMixin<CollectionInstance, CollectionInstance["id"]>;
    hasAssignerCollection: Sequelize.HasManyHasAssociationMixin<CollectionInstance, CollectionInstance["id"]>;
    hasAssignerCollections: Sequelize.HasManyHasAssociationsMixin<CollectionInstance, CollectionInstance["id"]>;
    countAssignerCollections: Sequelize.HasManyCountAssociationsMixin;

    getAssigneeCollections: Sequelize.BelongsToManyGetAssociationsMixin<CollectionInstance>;
    setAssigneeCollections: Sequelize.BelongsToManySetAssociationsMixin<CollectionInstance, CollectionInstance["id"], CollectionAssigneeAttributes>;
    addAssigneeCollections: Sequelize.BelongsToManyAddAssociationsMixin<CollectionInstance, CollectionInstance["id"], CollectionAssigneeAttributes>;
    addAssigneeCollection: Sequelize.BelongsToManyAddAssociationMixin<CollectionInstance, CollectionInstance["id"], CollectionAssigneeAttributes>;
    createAssigneeCollection: Sequelize.BelongsToManyCreateAssociationMixin<CollectionAttributes, CollectionInstance["id"], CollectionAssigneeAttributes>;
    removeAssigneeCollection: Sequelize.BelongsToManyRemoveAssociationMixin<CollectionInstance, CollectionInstance["id"]>;
    removeAssigneeCollections: Sequelize.BelongsToManyRemoveAssociationsMixin<CollectionInstance, CollectionInstance["id"]>;
    hasAssigneeCollection: Sequelize.BelongsToManyHasAssociationMixin<CollectionInstance, CollectionInstance["id"]>;
    hasAssigneeCollections: Sequelize.BelongsToManyHasAssociationsMixin<CollectionInstance, CollectionInstance["id"]>;
    countAssigneeCollections: Sequelize.BelongsToManyCountAssociationsMixin;

    getProfilePhoto: Sequelize.BelongsToGetAssociationMixin<ImageInstance>;
    setProfilePhoto: Sequelize.BelongsToSetAssociationMixin<ImageInstance, ImageInstance["id"]>;
    createProfilePhoto: Sequelize.BelongsToCreateAssociationMixin<ImageAttributes>;

    getImagesCreated: Sequelize.HasManyGetAssociationsMixin<ImageInstance>;
    setImagesCreated: Sequelize.HasManySetAssociationsMixin<ImageInstance, ImageInstance["id"]>;
    addImagesCreated: Sequelize.HasManyAddAssociationsMixin<ImageInstance, ImageInstance["id"]>;
    addImageCreated: Sequelize.HasManyAddAssociationMixin<ImageInstance, ImageInstance["id"]>;
    createImageCreated: Sequelize.HasManyCreateAssociationMixin<ImageAttributes, ImageInstance>;
    removeImageCreated: Sequelize.HasManyRemoveAssociationMixin<ImageInstance, ImageInstance["id"]>;
    removeImagesCreated: Sequelize.HasManyRemoveAssociationsMixin<ImageInstance, ImageInstance["id"]>;
    hasImageCreated: Sequelize.HasManyHasAssociationMixin<ImageInstance, ImageInstance["id"]>;
    hasImagesCreated: Sequelize.HasManyHasAssociationsMixin<ImageInstance, ImageInstance["id"]>;
    countImagesCreated: Sequelize.HasManyCountAssociationsMixin;

    getInvitedBy: Sequelize.BelongsToGetAssociationMixin<UserInstance>;
    setInvitedBy: Sequelize.BelongsToSetAssociationMixin<UserInstance, UserInstance["id"]>;
    createInvitedBy: Sequelize.BelongsToCreateAssociationMixin<UserAttributes>;
  };
```

The usage is as follows.

 - The argument following the -b flag gives the base model for which we are creating the interface for.

 - The array of arguments following the -a flag give the model name's for the models for which we are creating associations for.

 - The array of arguments following the -s flag give the aliases you want to give for each association, in singular form.

 - The array of arguments following the -p flag give the aliases you want to give for each association, in plural form.

 - The array of arguments following the -t flag give the type of association, i.e. on of BelongsTo, BelongsToMany, HasOne, or HasMany. These should match the function used in to create the association in the Model.associate function.

 - The array of arguments following the -j flag give the name of the join table to use for the BelongsToMany (n:m) association.

Note that,

 - the i'th argument in each array correspond to each other.

 - if giving an argument for the i'th association doesn't apply, an underscore should be given. E.g., in above example, a User only has one ProfilePhoto, so it doesn't have a plural. Similarly, for InvitedBy. Also observe, only AssigneeCollections is a many-to-many (as BelongsToMany is used to define it) so we don't need to specify join tables for the other associations.
 
 ## Using Custom Join Tables
 
 In Sequelize, one may simply specify a join table name on both BelongsToMany calls to have sequelize automatically create a join table in the schema. E.g,
 
 ```typescript
Collection.BelongsToMany(Image, { through: "CollectionImage" });
Image.BelongsToMany(Collection, { through: "CollectionImage" });
```

If you want to add more attributes to the join table, or customise it in some way, you can define the join table just like any other model and than set that to the `through` field. E.g.,

```typescript
User.BelongsToMany(Collection, { through: CollectionAssignee });
Collection.BelongsToMany(User, { through: CollectionAssignee });
```

Which is chosen has implications on the mixin definitions. Consider the mixins for the above to n:m associations. The first is defined as follows. Note the third type parameter to the mixin.

```typescript
setImages: Sequelize.BelongsToManySetAssociationsMixin<ImageInstance, ImageInstance["id"], "CollectionImage">
```

In this case, we only want to pass in the string of the join table name. In the other case, the join table is defined manually, so the join tables Attribute's interface needs to be passed in as the last parameter. 

```typescript
setAssigneeCollections: Sequelize.BelongsToManySetAssociationsMixin<CollectionInstance, CollectionInstance["id"], CollectionAssigneeAttributes>;
```

This library supports both. To force the latter case, simply pass in a join table model name, e.g. `-j CollectionAssignee`, and the script will automatically put `CollectionAssigneeAttributes` in the third type parameter. For the former case, wrap the join table name in double quotes (probably have to be escaped at command line). E.g., `-j \"CollectionImage\"` will put `"CollectionImage"` in the third type parameter.

## Known Issues

This library assumes that the primary key of the association will always be its `id` field. This is not always the case (e.g. the primary key of an image could be its hash). 
