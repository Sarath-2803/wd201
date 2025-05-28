/* eslint-disable no-undef */
/* eslint-env jest */

/*
const todoList = require("../todo");

const { all, markAsComplete, add, overdue, dueToday, dueLater } = todoList();

const formattedDate = (d) => {
    return d.toISOString().split("T")[0];
};

const dateToday = new Date();
const today = formattedDate(dateToday);
const yesterday = formattedDate(new Date(new Date().setDate(dateToday.getDate() - 1)));
const tomorrow = formattedDate(new Date(new Date().setDate(dateToday.getDate() + 1)));

describe("Todo test suite", () => {
    beforeAll(() => {
        add({
            title: "Test Todo",
            dueDate: today,
            completed: false,
        });
    });

    test("should add new todo", () => {
        const todoItemsCount = all.length;
        add({
            title: "New Test Todo",
            dueDate: today,
            completed: false,
        });
        expect(all.length).toBe(todoItemsCount + 1);
    });

    test("should mark todo as complete", () => {
        expect(all[0].completed).toBe(false);
        markAsComplete(0);
        expect(all[0].completed).toBe(true);
    });

    test("should retrieve overdue items", () => {
        add({
            title: "Overdue Todo",
            dueDate: yesterday,
            completed: false,
        });
        const overdueItems = overdue();
        expect(overdueItems.length).toBe(1);
        expect(overdueItems[0].title).toBe("Overdue Todo");
    });

    test("should retrieve due today items", () => {
        add({
            title: "Due Today Todo",
            dueDate: today,
            completed: false,
        });
        const dueTodayItems = dueToday();
        expect(dueTodayItems.length).toBeGreaterThanOrEqual(1);
        expect(dueTodayItems.some((item) => item.title === "Due Today Todo")).toBe(true);
    });

    test("should retrieve due later items", () => {
        add({
            title: "Due Later Todo",
            dueDate: tomorrow,
            completed: false,
        });
        const dueLaterItems = dueLater();
        expect(dueLaterItems.length).toBe(1);
        expect(dueLaterItems[0].title).toBe("Due Later Todo");
    });
});

*/



// __tests__/todo.js
/* eslint-disable no-undef */
const db = require("../models");

describe("Todolist Test Suite", () => {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
  });

  test("Should add new todo", async () => {
    const todoItemsCount = await db.Todo.count();
    await db.Todo.addTask({
      title: "Test todo",
      completed: false,
      dueDate: new Date(),
    });
    const newTodoItemsCount = await db.Todo.count();
    expect(newTodoItemsCount).toBe(todoItemsCount + 1);
  });
});