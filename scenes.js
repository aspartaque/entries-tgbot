const {Scenes} = require('telegraf')

class ScenesGenerator {

  UserName() {
    const fio = new Scenes.BaseScene('fio');
    fio.enter((ctx) => ctx.reply('Пожалуйста введите вашу Фамилию и Имя'));
    fio.on('text', async (ctx) => {

      if (ctx.message.text != '/start' && ctx.message.text != '/get' && ctx.message.text != '/clear') {
        const newFio = ctx.message.text;
        const userId = ctx.update.message.from.id;
        await ctx.reply(`Привет ${newFio}!`);
        await ctx.scene.enter('tel', {name: newFio, id: userId});
      } else {
        await ctx.reply('Пиши имя, а не команду');
      }

    })
    fio.on('message', async (ctx) => ctx.reply('Введите текстом!'));
    return fio;
  }
  UserTel() {
    const tel = new Scenes.BaseScene('tel')
    tel.enter((ctx) => ctx.reply('Введите ваш номер телефона'));
    tel.on('text', async (ctx) => {
      if (ctx.message.text != '/start' && ctx.message.text != '/get' && ctx.message.text != '/clear') {
        ctx.session.id = ctx.scene.state.id;
        ctx.session.name = ctx.scene.state.name;
        ctx.session.tel = ctx.message.text;
        await ctx.reply(`Ваше имя ${ctx.session.name}, Ваш номер телефона ${ctx.session.tel}`);
        await ctx.reply('Ваши контактные данные записаны! Нажмите на /calendar чтобы показать дни');
        await ctx.scene.leave();
      } else {
        await ctx.reply('Пиши номер телефона, а не команду');
      }

    })
    tel.on('message', async (ctx) => ctx.reply('Введите текстом!'));
    return tel;
  }

}

module.exports = ScenesGenerator;