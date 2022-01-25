// @ts-check

module.exports = {
  translation: {
    appName: 'Менеджер задач',
    flash: {
      session: {
        create: {
          success: 'Вы залогинены',
          error: 'Неправильный емейл или пароль',
        },
        delete: {
          success: 'Вы разлогинены',
        },
      },
      statuses: {
        create: {
          success: 'Статус успешно создан',
          error: 'Не удалось создать статус',
        },
        edit: {
          success: 'Статус успешно изменён',
          error: 'Не удалось изменить статус',
        },
        delete: {
          success: 'Статус успешно удалён',
          error: 'Не удалось удалить статус',
        },
      },
      users: {
        create: {
          error: 'Не удалось зарегистрировать',
          success: 'Пользователь успешно зарегистрирован',
        },
        edit: {
          success: 'Пользователь успешно изменён',
          error: 'Не удалось изменить пользователя',
        },
        delete: {
          success: 'Пользователь удален',
          error: 'Не удалось удалить пользователя',
        },
        accessDenied: 'Вы не можете редактировать или удалять другого пользователя',
      },
      tasks: {
        create: {
          success: 'Задача успешно создана',
          error: 'Не удалось создать задачу',
        },
        edit: {
          success: 'Задача успешно изменена',
          error: 'Не удалось изменить задачу',
        },
        delete: {
          success: 'Задача успешно удалена',
          error: 'Не удалось удалить задачу',
        },
        accessDenied: 'Вы не можете редактировать или удалять другого пользователя',
      },
      labels: {
        create: {
          success: 'Метка успешно создана',
          error: 'Не удалось создать метку',
        },
        edit: {
          success: 'Метка успешно изменена',
          error: 'Не удалось изменить метку',
        },
        delete: {
          success: 'Метка успешно удалена',
          error: 'Не удалось удалить метку',
        },
      },
      authError: 'Доступ запрещён! Пожалуйста, авторизируйтесь.',
    },
    layouts: {
      application: {
        users: 'Пользователи',
        statuses: 'Статусы',
        labels: 'Метки',
        tasks: 'Задачи',
        signIn: 'Вход',
        signUp: 'Регистрация',
        signOut: 'Выход',
      },
    },
    views: {
      form: {
        name: 'Наименование',
        firstName: 'Имя',
        lastName: 'Фамилия',
        email: 'Email',
        password: 'Пароль',
        description: 'Описание',
        statusId: 'Статус',
        executorId: 'Исполнитель',
        labels: 'Метки',
      },
      session: {
        new: {
          signIn: 'Вход',
          submit: 'Войти',
        },
      },
      manage: {
        edit: 'Изменить',
        delete: 'Удалить',
      },
      users: {
        id: 'ID',
        fullName: 'Полное имя',
        email: 'Email',
        createdAt: 'Дата создания',
        notAnyUsers: 'Пользователи отсутствуют',
        new: {
          submit: 'Сохранить',
          signUp: 'Регистрация',
        },
        edit: {
          title: 'Редактирование пользователя',
          save: 'Сохранить',
        },
      },
      welcome: {
        index: {
          hello: 'Привет от Хекслета!',
          description: 'Практические курсы по программированию',
          more: 'Узнать Больше',
        },
      },
      statuses: {
        index: {
          id: 'ID',
          name: 'Наименование',
          createdAt: 'Дата создания',
          notAnyStatuses: 'Статусы отсутствуют',
          create: 'Создать статус',
        },
        new: {
          title: 'Создание статуса',
          create: 'Создать',
        },
        edit: {
          title: 'Изменение статуса',
          save: 'Изменить',
        },
      },
      tasks: {
        index: {
          id: 'ID',
          name: 'Наименование',
          status: 'Стаус',
          author: 'Автор',
          executor: 'Исполнитель',
          createdAt: 'Дата создания',
          notAnyTasks: 'Задачи отсутствуют',
          create: 'Создать задачу',
        },
        view: {
          author: 'Автор',
          executor: 'Исполнитель',
          status: 'Статус',
          createAt: 'Дата создания',
          labels: 'Метки',
        },
        new: {
          nonExecutor: 'Не назначен',
          title: 'Создание задачи',
          create: 'Создать',
        },
        edit: {
          title: 'Изменение задачи',
          save: 'Изменить',
        },
      },
      labels: {
        index: {
          id: 'ID',
          name: 'Наименование',
          create: 'Создать метку',
          createdAt: 'Дата создания',
          notAnyTasks: 'Метки отсутствуют',
        },
        new: {
          title: 'Создание метки',
          create: 'Создать',
        },
        edit: {
          title: 'Изменение метки',
          save: 'Изменить',
        },
      },
    },
  },
};
