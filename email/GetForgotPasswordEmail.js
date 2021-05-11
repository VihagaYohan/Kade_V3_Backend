exports.getForgotPasswordEmail = (name, url) => {
  return `<!Doctype html>
            <head>
                <title>Kade Password Reset</title>
                <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
                <meta content="width=device-width" name="viewport" />
                <style type="text/css">
                @font-face {
                  font-family: &#x27;Postmates Std&#x27;;
                  font-weight: 600;
                  font-style: normal;
                  src: local(&#x27;Postmates Std Bold&#x27;), url('https://fonts.googleapis.com/css2?family=Roboto&display=swap');
                }
          
                @font-face {
                  font-family: &#x27;Postmates Std&#x27;;
                  font-weight: 500;
                  font-style: normal;
                  src: local(&#x27;Postmates Std Medium&#x27;), url('https://fonts.googleapis.com/css2?family=Roboto&display=swap') format(&#x27;woff&#x27;);
                }
          
                @font-face {
                  font-family: &#x27;Postmates Std&#x27;;
                  font-weight: 400;
                  font-style: normal;
                  src: local(&#x27;Postmates Std Regular&#x27;), url('https://fonts.googleapis.com/css2?family=Roboto&display=swap') format(&#x27;woff&#x27;);
                }
              </style>

              <style media="screen and (max-width:680px)">
                    @media screen and (max-width:680px){
                        .page-center{
                            padding-left:0 !important;
                            padding-right:0 !important;
                        }

                        .footer-center{
                            padding-left:20px !important
                            padding-right:20px !important
                        }
                    }
              </style>
            </head>
            <body style="background-color:#f4f4f4">
            <table 
            cellpadding="0"
            cellspacing="0" 
            style="
                width:100%; 
                height:100%; 
                background-color:#f4f4f5;
                text-align:center">
                    <tr>
                        <td>
                        <p style="color:black">You are receving this email because you (or someone else) has requested the reset of a password. Please click on below button</p>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <a 
                            href="${url}"
                            style="
                            margin-top: 36px;
                            -ms-text-size-adjust: 100%;
                            -ms-text-size-adjust: 100%;
                            -webkit-font-smoothing: antialiased;
                            -webkit-text-size-adjust: 100%;
                            color: #ffffff;
                            font-family: 'Postmates Std', 'Helvetica',
                              -apple-system, BlinkMacSystemFont, 'Segoe UI',
                              'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell',
                              'Fira Sans', 'Droid Sans', 'Helvetica Neue',
                              sans-serif;
                            font-size: 12px;
                            font-smoothing: always;
                            font-style: normal;
                            font-weight: 600;
                            letter-spacing: 0.7px;
                            line-height: 48px;
                            mso-line-height-rule: exactly;
                            text-decoration: none;
                            vertical-align: top;
                            width: 220px;
                            background-color: purple;
                            border-radius: 28px;
                            display: block;
                            text-align: center;
                            text-transform: uppercase;" target="_blank">Click Here</a>
                        <td>
                    <tr>
            </table>
            </body>
        <html>`;
};
