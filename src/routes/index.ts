import * as express from 'express';
import { Router, Request, Response } from 'express';
import * as HttpStatus from 'http-status-codes';
import { Login } from '../models/login';

const loginModel = new Login();

const router: Router = Router();

router.get('/', (req: Request, res: Response) => {
  res.render('register', {
    title: 'sd'
  });
});

router.get('/request', (req: Request, res: Response) => {
  const state = makeid(10);
  res.redirect(`https://auth.moph.go.th/v1/oauth2/auth?response_type=code&client_id=${process.env.CLIENT_ID}&state=${state}&scope=cid%20fname%20lname%20email%20hospcode%20ial`)
});

router.get('/callback', async (req: Request, res: Response) => {
  try {
    const code = req.query.code;
    const token: any = await loginModel.getToken(code);
    if (token.access_token) {
      const profile: any = await loginModel.getProfile(token.access_token);
      if (profile.ok) {
        if (profile.user.is_kyc == 'Y') {
          res.render('input', {
            fname: profile.user.first_name,
            lname: profile.user.last_name,
            email: profile.user.email,
            hospcode: profile.user.hospcode,
            token: token.access_token,
          })
        } else {
          res.send({ error: 'คุณยังไม่ได้ยืนยันตัวตน' });

        }

      } else {
        res.status(401)
        res.send();
      }
      console.log(profile);
    } else {
      res.status(401)
      res.send();
    }


  } catch (error) {
    console.log(error);
  }
});


router.get('/confirm', async (req: Request, res: Response) => {
  const { email, token, tel } = req.query;
  try {
    const profile: any = await loginModel.getProfile(token);
    if (profile.ok) {
      if (profile.user.is_kyc == 'Y') {
        await loginModel.save(req.db, {
          cid: profile.user.cid,
          fname: profile.user.first_name,
          lname: profile.user.last_name,
          hospcode: profile.user.hospcode,
          email: email,
          tel: tel
        })
        res.render('confirm')
      } else {
        res.send({ error: 'คุณยังไม่ได้ยืนยันตัวตน' });
      }
    } else {
      res.status(401)
      res.send();
    }
  } catch (error) {
    console.log(error);
    res.status(500)
    res.send();
  }

});

function makeid(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

export default router;