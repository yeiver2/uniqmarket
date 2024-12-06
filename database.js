import mysql from 'mysql2/promise'

//Poner aqui Credenciales de la base de datos
const config = {
    host: "localhost",
    user: "root",
    password: "12345",
    database: "uniqmarket_db"
}

const connection = await mysql.createConnection(config)

//Modelo de Base de datos
export class productModel {
    static async getAll(page = 1, limit = 8, orderBy = '', brandFilter = '', params = [], priceFilter = '', categoryFilter = '', searchFilter = '') {
        const offset = (page - 1) * limit;

        // Agregar el filtro de búsqueda en el nombre del producto
        let searchQuery = '';
        if (searchFilter) {
            searchQuery = 'AND p.name LIKE ?'; // Usar LIKE para buscar coincidencias parciales
            params.push(`%${searchFilter}%`); // Agregar el término de búsqueda en el formato adecuado
        }

        // Construcción de la consulta para obtener los productos
        const query = `
            SELECT p.product_id, p.brand, p.name, p.description, p.sku, p.price, p.category_id, p.image_url, v.name_vendor AS vendor_name
            FROM products p
            LEFT JOIN vendors v ON p.sold_by = v.vendor_id
            ${categoryFilter} ${brandFilter} ${priceFilter} ${searchQuery} ${orderBy}
            LIMIT ? OFFSET ?;
        `;

        params.push(limit, offset);

        // Consulta para obtener los productos
        const [products] = await connection.query(query, params);

        // Consulta para contar el total de productos con los filtros aplicados
        let countQuery = `
            SELECT COUNT(*) AS total 
            FROM products p
            LEFT JOIN vendors v ON p.sold_by = v.vendor_id
            ${categoryFilter} ${brandFilter} ${priceFilter} ${searchQuery};
        `;

        // Realizar la consulta de conteo
        const [[{ total }]] = await connection.query(countQuery, params);

        // Regresa los productos y los filtros
        return { products, total };
    }
};
export default connection;
