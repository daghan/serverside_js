const mongoose = require('mongoose');
//const Dishes = require('./dishes')
require('mongoose-currency').loadType(mongoose);

const { Schema } = mongoose;


const favoriteSchema = new Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        dishes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Dish',
        }]
    },
    {
        timestamps: true,
    }
);



const Favorites = mongoose.model('Favorite', favoriteSchema);
module.exports = Favorites;