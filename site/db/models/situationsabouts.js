'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SituationsAbouts extends Model {

    static associate(models) {
      // define association here
      SituationsAbouts.hasMany(models.AboutsCompanies, {foreignKey:'situationAboutId'});
    }
  }
  SituationsAbouts.init({
    nameSituation: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'SituationsAbouts',
  });
  return SituationsAbouts;
};