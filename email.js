import { createTransport } from 'nodemailer';
export  const emailer = {
    send: async (conf, email, subject, text) => {
       try {
          const transporter = createTransport({
             service: 'gmail',
             auth: {
               user: conf.mailFrom,
               pass: conf.mailSecret,
             },
           });
          return await transporter.sendMail({
             from: conf.mailFrom,
             to: email,
             subject: subject,
             html: text 
           })
       } catch (error) {
          throw(error);
       } 
    },
    test: async () => {
       return transporter.verify();
    }
 }
 