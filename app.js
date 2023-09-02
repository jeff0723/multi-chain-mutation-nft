const fs = require("fs");
const imgurUploader = require("imgur-uploader");

imgurUploader(fs.readFileSync("cat.jpg"), { title: "Hello!" }).then((data) => {
  console.log(data);
  /*
    {
        id: 'OB74hEa',
        link: 'http://i.imgur.com/jbhDywa.jpg',
        title: 'Hello!',
        date: Sun May 24 2015 00:02:41 GMT+0200 (CEST),
        type: 'image/jpg',
        ...
    }
    */
});
