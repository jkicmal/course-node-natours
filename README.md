# Natours App
Project based on Jonas Schmedtmann [course](https://www.udemy.com/nodejs-express-mongodb-bootcamp/).

### Postman

Setting environmental variable based on response.
Put it in Tests tab.

``` text
pm.environment.set("jwt", pm.response.json().token);
```

### Packages used

- bcryptjs
- dotenv
- express
- jsonwebtoken
- mongoose
- morgan
- nodemailer
- slugify
- validator
- crypto
- fs
- express-rate-limit

### Applications used

- Postman
- Mailtrap
- MongoDB Compass
- MongoDB Atlas (Database in cloud)
