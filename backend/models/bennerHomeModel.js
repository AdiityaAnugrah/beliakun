// models/bennerHomeModel.js
module.exports = (sequelize, DataTypes) => {
    const BennerHome = sequelize.define("BennerHome", {
        nama: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        tipe_media: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        media_url: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        deskripsi: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        urutan: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        link: {
            type: DataTypes.STRING,
            allowNull: true, // bisa kosong
        },
        active: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    });
    return BennerHome;
};
