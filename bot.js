//main
const { Scenes, session, Telegraf, Markup, Stage } = require('telegraf');
require('dotenv').config();
const bot = new Telegraf(process.env.TOKEN);

//scenes
const ScenesGenerator = require('./scenes');
const curScene = new ScenesGenerator();
const nameScene = curScene.UserName();
const telScene = curScene.UserTel();

//session
const LocalSession = require('telegraf-session-local');

//database
const Entries = require('./models');

//connect database
const sequelize = require('./connect');

//texts
const static = require('./text');
const msg = static.text;

//calendar
const Calendar = require('telegraf-calendar-telegram')
const blockedDays = [];
const calendar = new Calendar(bot, {
	startWeekDay: 1,
	weekDayNames: ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"],
	monthNames: [
		"Янв", "Фев", "Март", "Апр", "Май", "Июнь",
		"Июль", "Авг", "Сен", "Окт", "Ноя", "Дек"
	],
  minDate: null,
  maxDate: null,
  ignoreWeekDays: blockedDays,
	shortcutButtons: []
});


//result array - need change maybe delete?
const result = {
  day: null,
  time: null,
};

const stage = new Scenes.Stage([nameScene, telScene])
bot.use((new LocalSession({ database: 'db.json' })).middleware())
bot.use(session(), stage.middleware())


bot.start(async (ctx) => {
  try {
    if (ctx.session.name == null) {
      ctx.scene.enter('fio');
    } else {
      ctx.replyWithHTML('Мы уже знакомы!\nВызывайте команду /calendar для выбора даты!')
    }
  } catch (e) {
    console.error(e);
  }
})


calendar.setDateListener((ctx, date) => {
  if (result.day == null) {
    result.day = date;
    confirm(ctx, result); 
  } else {
    ctx.reply(`Вы уже записаны в ${result.day}! Если хотите, можете вызвать команду /clear для удаления записи.`)
  }
  // getNewTimes(ctx, result);
});
bot.command("/calendar", (ctx) => {
  const today = new Date();
  const minDate = new Date();
  minDate.setMonth(today.getMonth() - 0);
  const maxDate = new Date();
  maxDate.setMonth(today.getMonth() + 1);
  maxDate.setDate(today.getDate());

	ctx.reply("Выберите дату", calendar.setMinDate(minDate).setMaxDate(maxDate).getCalendar())
});

// function getNewTimes(ctx, result) {
//   try {
//     let arr = [];
//     msg.days[1].times.forEach((el) => {
//       let timeName = el;
//       result.cart.time = timeName;
//       arr.push(Markup.button.callback(el, timeName));
//       pickTime(timeName);
//     })
//     var perChunk = 4;
//     var result = arr.reduce((resultArray, item, index) => { 
//         const chunkIndex = Math.floor(index/perChunk)
//         if(!resultArray[chunkIndex]) {
//           resultArray[chunkIndex] = []
//         }
//         resultArray[chunkIndex].push(item)
//         return resultArray
//       }, 
//     [])

//     ctx.replyWithHTML(`Выберите удобное для Вас время `, Markup.inlineKeyboard(
//       result
//     ))
//     // confirm(ctx, result);
//   } catch(e) {
//     console.error(e)
//   }
// }

// bot.command('/get', (ctx) => {
//   try {
//     if (result.cart.day === null) { //need change
//       ctx.replyWithHTML('Выберите день недели', Markup.inlineKeyboard(
//         [
//           [
//             Markup.button.callback(msg.days[0].monday.name, 'monday'),
//             Markup.button.callback(msg.days[0].tuesday.name, 'tuesday'),
//             Markup.button.callback(msg.days[0].wednesday.name, 'wednesday'),
//           ],
//           [
//             Markup.button.callback(msg.days[0].thursday.name, 'thursday'),
//             Markup.button.callback(msg.days[0].friday.name, 'friday'),
//             Markup.button.callback(msg.days[0].saturday.name, 'saturday'),
//             Markup.button.callback(msg.days[0].sunday.name, 'sunday'),
//           ]
//         ],
//       ))
//     } else {
//       ctx.reply(`Вы уже записаны в ${result.cart.day}, в ${result.cart.time}!`);
//     }
//   } catch(e) {
//     console.error(e)
//   }
// });





// for(obj of msg.days) {
//   Object.keys(obj).forEach((key) => {
//     let dayName = obj[key].name;
//     pickDay(key, dayName);
//   })
// }


//Выбрать день недели
// function pickDay(name, dayName) {
//   bot.action(name, async (ctx) => {
//     try {
//       await ctx.answerCbQuery();
//       result.cart.day = dayName;
//       getTime(ctx, name, dayName);
//     } catch(e) {
//       console.error(e)
//     }
//   })
// }


//Получить список часов в опр.день
// function getTime(ctx, name, dayName) {
//   for(obj of msg.days) {
//     Object.keys(obj).forEach((key) => {
//       if (key == name) {
//         try {
//           let arr = [];
//           obj[key].times.forEach((el) => {
//             if (el == 'Выходной') 
//             {
//               ctx.reply('В этот день у Мастера выходной! Выберите другой день!');
//             } 
//             else if (obj[key].times.length <= 0) 
//             {
//               ctx.reply('В этот день свободных часов не осталось!');
//             } 
//             else
//             {
//               let timeName = el;
//               pickTime(timeName);
//               arr.push(Markup.button.callback(el, timeName));
//             }
//           })
          
//           var perChunk = 4;
//           var result = arr.reduce((resultArray, item, index) => { 
//               const chunkIndex = Math.floor(index/perChunk)
//               if(!resultArray[chunkIndex]) {
//                 resultArray[chunkIndex] = []
//               }
//               resultArray[chunkIndex].push(item)
//               return resultArray
//             }, 
//           [])

//           ctx.replyWithHTML(`Выберите удобное для Вас время в ${dayName}`, Markup.inlineKeyboard(
//             result
//           ))
//         } catch(e) {
//           console.error(e)
//         }
//       }
//     })
//   }
// }


//Выбрать время(часы)
// function pickTime(timeName) {
//   bot.action(timeName, async (ctx) => {
//     try {
//       confirm(ctx, result); 
//     } catch(e) {
//       console.error(e)
//     }
//   })
// }

//Подтвердить запись
function confirm(ctx, result) {
  ctx.replyWithHTML(
    `
    <i>ФИО:</i> <b>${ctx.session.name}</b>\n<i>Номер телефона:</i> <b>${ctx.session.tel}</b>\n<i>Выбранная дата:</i> <b>${result.day}</b>\n\n<i>Подтверждаете запись?</i>
    `,
    Markup.inlineKeyboard(
      [
        [
          Markup.button.callback('Да, подтверждаю', 'entry_confirm'),
          Markup.button.callback('Назад', 'go_back'),
        ],
      ],
    )
  );
  bot.action('entry_confirm', async (ctx) => {
    try {
      await ctx.answerCbQuery();
      if (ctx.session.name != null && ctx.session.tel != null && result.day != null) {
        await sequelize.authenticate();
        await sequelize.sync();
        Entries.create({id:ctx.session.id,user_name:ctx.session.name,user_tel:ctx.session.tel,entry_day:result.day,entry_time:result.time}).then(res=>{
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
        ctx.reply(`Вы записаны в ${result.day}, в ${result.time}!`);
        return true;
      } else {
        ctx.reply(`Некоторые поля не заполнены!`);
      }
    } catch(e) {
      console.error(e)
    }
  })
}

bot.command('/clear', async (ctx) => {
  try {
    if (result.day != null) {
      result.day = null;
      result.time = null;
      ctx.reply(`Ваши записи удалены!`);
    } else {
      ctx.reply(`У вас нет записей!`);
    }
  } catch(e) {
    console.error(e)
  }
});

bot.action('go_back', async (ctx) => {
  await ctx.answerCbQuery();
  ctx.reply('Назад не работает');
})




bot.hears('автор', (ctx) => ctx.reply('Гений разработки: @spxrtxk'))
bot.on('text', (ctx) => ctx.reply('Я не понимаю, пиши команду!'))
bot.on('sticker', (ctx) => ctx.reply('👍'))
bot.on('photo', (ctx) => ctx.reply('Фотка класс! 👍'))
bot.on('document', (ctx) => ctx.reply('Файл?! Я не могу открыть ее, к сожалению'))
bot.on('audio', (ctx) => ctx.reply('Ты серьезно!? У меня нет ушей!'))
bot.on('location', (ctx) => ctx.reply('Теперь я знаю где ты живешь!'))
bot.on('video', (ctx) => ctx.reply('Мне нельзя смотреть видосики на работе!'))
bot.on('voice', (ctx) => ctx.reply('Ты серьезно!? У меня нет ушей!'))


bot.launch();
// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))