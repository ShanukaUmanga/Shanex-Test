const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const pairRouter = require('./pair');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use('/pair', pairRouter);

app.listen(PORT, () => {
    console.log(`SHANEX-MD Server is running on port ${PORT}`);
});
