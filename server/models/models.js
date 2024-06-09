const sequelize = require("../db");
const { DataTypes } = require("sequelize");

const user = sequelize.define("user", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: true },
  email: { type: DataTypes.STRING, unique: false, allowNull: false },
  password: { type: DataTypes.STRING },
  phone: { type: DataTypes.CHAR, unique: false, allowNull: true },
  comment: { type: DataTypes.TEXT },
  role: { type: DataTypes.INTEGER, allowNull: true,  defaultValue: 0},
  source: {type: DataTypes.STRING },
  deleted_at: { type: DataTypes.DATE }
  },
  {
    tableName: "user",
  }
)

const tokenModel = sequelize.define("token", {
  userId: {type: DataTypes.INTEGER},
  refreshToken: {type: DataTypes.STRING, required: true},
})

const orders = sequelize.define("orders", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  date: { type: DataTypes.DATEONLY },
  time: { type: DataTypes.TIME },
  id_user: { type: DataTypes.INTEGER },
  car: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.INTEGER },
  id_executer: { type: DataTypes.INTEGER, allowNull: true },
  deleted_at: { type: DataTypes.DATE },
});

const order_detail = sequelize.define( "order_detail",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_orders: { type: DataTypes.INTEGER, allowNull: true },
    id_details: { type: DataTypes.INTEGER, allowNull: true },
    quantity: { type: DataTypes.INTEGER, allowNull: true },
  },
  {
    tableName: "order_detail",
  }
);
const details = sequelize.define("details", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  cost: { type: DataTypes.FLOAT, allowNull: true },
  quantity_detail: { type: DataTypes.INTEGER, allowNull: true },
});

const AvailableTime = sequelize.define("AvailableTime", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  time: { type: DataTypes.TIME, allowNull: false },
  executerId: { type: DataTypes.INTEGER, allowNull: true },
  isAvailable: { type: DataTypes.BOOLEAN, defaultValue: true },
  deleted_at: { type: DataTypes.DATE, allowNull: true},
});

user.hasMany(tokenModel, {foreignKey: 'userId', as: 'token'});
tokenModel.belongsTo(user, {foreignKey: 'userId', as: 'users'});

user.hasMany(orders, { foreignKey: "id_user" });
orders.belongsTo(user, { foreignKey: "id_user", as: "user" });
orders.belongsTo(user, { foreignKey: "id_executer", as: "executer" });

orders.hasMany(order_detail, { foreignKey: "id_orders" });
details.hasMany(order_detail, { foreignKey: "id_details", as: "orderDetailsAssoc"});

orders.belongsToMany(details, { through: order_detail, foreignKey: "id_orders", as: "orderDetails", uniqueKey: null});
details.belongsToMany(orders, { through: order_detail, foreignKey: "id_details", as: "associatedOrders", uniqueKey: null});

order_detail.belongsTo(orders, { foreignKey: "id_orders" });
order_detail.belongsTo(details, { foreignKey: "id_details" });

user.hasMany(AvailableTime, { foreignKey: "executerId", as: "availableTimes" });
AvailableTime.belongsTo(user, { foreignKey: "executerId", as: "executer" });

module.exports = {
  user,
  tokenModel,
  orders,
  order_detail,
  details,
  AvailableTime
};
