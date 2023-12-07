import { Knex } from 'knex'
var axios = require("axios").default;
export class Login {
  save(db: Knex.QueryInterface, data) {
    return db.table('register')
      .insert(data);
  }

  getToken(code) {

    var options = {
      method: 'POST',
      url: 'https://auth.moph.go.th/v1/oauth2/token',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: {
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: 'http://localhost:4200/callback',
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET
      }
    };
    return new Promise<void>((resolve, reject) => {

      axios.request(options).then(function (response) {
        console.log(response.data);
        resolve(response.data)
      }).catch(function (error) {
        console.error(error);
      });
    })
  }

  getProfile(token) {
    var options = {
      method: 'GET',
      url: 'https://members.moph.go.th/api/v2/info',
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
    return new Promise<void>((resolve, reject) => {
      axios.request(options).then(function (response) {
        console.log(response.data);
        resolve(response.data)
      }).catch(function (error) {
        console.error(error);
      });
    })
  }
}