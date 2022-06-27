const { Scenes, session, Telegraf, Markup, Stage } = require('telegraf');
const static = require('./text');
require('dotenv').config();
const bot = new Telegraf(process.env.TOKEN);
const ScenesGenerator = require('./scenes');
const curScene = new ScenesGenerator();
const nameScene = curScene.UserName();
const telScene = curScene.UserTel();
const LocalSession = require('telegraf-session-local');

const Entries = require('./models');

const sequelize = require('./connect');


const msg = static.text;
const result = {
  user: {
    id: null,
    name: null,
    tel: null
  },
  cart: {
    day: null,
    time: null,
  }
};

const stage = new Scenes.Stage([nameScene, telScene])
bot.use((new LocalSession({ database: 'db.json' })).middleware())
bot.use(session(), stage.middleware())


bot.start(async (ctx) => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }

  ctx.scene.enter('fio');
})


bot.command('/get', (ctx) => {
  try {
    if (result.cart.day === null) { //need change
      ctx.replyWithHTML('Выберите день недели', Markup.inlineKeyboard(
        [
          [
            Markup.button.callback(msg.days[0].monday.name, 'monday'), 
            Markup.button.callback(msg.days[0].tuesday.name, 'tuesday'),
            Markup.button.callback(msg.days[0].wednesday.name, 'wednesday'),
          ],
          [
            Markup.button.callback(msg.days[0].thursday.name, 'thursday'), 
            Markup.button.callback(msg.days[0].friday.name, 'friday'),
            Markup.button.callback(msg.days[0].saturday.name, 'saturday'),
            Markup.button.callback(msg.days[0].sunday.name, 'sunday'),
          ]
        ],
      )) 
    } else {
      ctx.reply(`Вы уже записаны в ${result.cart.day}, в ${result.cart.time}!`);
    }
  } catch(e) {
    console.error(e)
  }
});


bot.command('/clear', async (ctx) => {
  try {
    if (result.cart.day != null) {
      result.cart.day = null;
      result.cart.time = null;
      ctx.reply(`Ваши записи удалены!`);
    } else {
      ctx.reply(`У вас нет записей!`);
    }
  } catch(e) {
    console.error(e)
  }
});


for(obj of msg.days) {
  Object.keys(obj).forEach((key) => {
    let dayName = obj[key].name;
    pickDay(key, dayName);
  })
}


//Выбрать день недели
function pickDay(name, dayName) {
  bot.action(name, async (ctx) => {
    try {
      await ctx.answerCbQuery();
      result.cart.day = dayName;
      getTime(ctx, name, dayName);
    } catch(e) {
      console.error(e)
    }
  })
}


//Получить список часов в опр.день
function getTime(ctx, name, dayName) {
  for(obj of msg.days) {
    Object.keys(obj).forEach((key) => {
      if (key == name) {
        try {
          let arr = [];
          obj[key].times.forEach((el) => {
            if (el == 'Выходной') 
            {
              ctx.reply('В этот день у Мастера выходной! Выберите другой день!');
            } 
            else if (obj[key].times.length <= 0) 
            {
              ctx.reply('В этот день свободных часов не осталось!');
            } 
            else
            {
              let timeName = el;
              pickTime(timeName);
              arr.push(Markup.button.callback(el, timeName));
            }
          })
          
          var perChunk = 4;
          var result = arr.reduce((resultArray, item, index) => { 
              const chunkIndex = Math.floor(index/perChunk)
              if(!resultArray[chunkIndex]) {
                resultArray[chunkIndex] = []
              }
              resultArray[chunkIndex].push(item)
              return resultArray
            }, 
          [])

          ctx.replyWithHTML(`Выберите удобное для Вас время в ${dayName}`, Markup.inlineKeyboard(
            result
          ))
        } catch(e) {
          console.error(e)
        }
      }
    })
  }
}


//Выбрать время(часы)
function pickTime(timeName) {
  bot.action(timeName, async (ctx) => {
    try {
      await ctx.answerCbQuery();
      result.user.id = ctx.session.id;
      result.user.name = ctx.session.name;
      result.user.tel = ctx.session.tel;
      result.cart.time = timeName;
      ctx.session = result;
      Entries.create({id:result.user.id,user_name:result.user.name,user_tel:result.user.tel,entry_day:result.cart.day,entry_time:result.cart.time}).then(res=>{
        const user = {
          id: res.id, 
          user_name: res.user_name, 
          user_tel: res.user_tel,
          entry_day: res.entry_day,
          entry_time: res.entry_time,
        }
        console.log(user);
      }).catch(err=>console.log(err));
        await sequelize.sync();
        ctx.reply('Вы записаны в ' + result.cart.day + ', в ' + result.cart.time + '!');
        return true;
    } catch(e) {
      console.error(e)
    }
  })
}







bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))