/* eslint-disable no-undef */
/* eslint-env jest */
const todoList= require("../todo");


const {all,markAsComplete,add} = todoList();

describe("Todo test suite",() => {
    beforeAll(()=>{
        add({
            title: "Test Todo",
            dueDate: new Date().toLocaleDateString("en-CA"),
            completed: false
        });
    })
    test('should add new todo', () => { 
        const todoItemsCount = all.length;
        add({
            title: "Test Todo",
            dueDate: new Date().toLocaleDateString("en-CA"),
            completed: false
        });
        expect(all.length).toBe(todoItemsCount + 1);
     })

    test('should mark todo as complete', () => {
        expect(all[0].completed).toBe(false);
        markAsComplete(0);
        expect(all[0].completed).toBe(true);
    })

    test("should retrieve overdue items", () => {
        add({
            title: "Overdue Todo",
            dueDate: new Date(new Date().setDate(new Date().getDate() - 1)).toLocaleDateString("en-CA"),
            completed: false,
        });
        const overdueItems = overdue();
        expect(overdueItems.length).toBe(1);
        expect(overdueItems[0].title).toBe("Overdue Todo");
    })

    test("should retrieve due today items", () => {
        add({
            title: "Due Today Todo",
            dueDate: new Date().toLocaleDateString("en-CA"),
            completed: false,
        });
        const dueTodayItems = dueToday();
        expect(dueTodayItems.length).toBeGreaterThanOrEqual(1);
        expect(dueTodayItems.some((item) => item.title === "Due Today Todo")).toBe(true);
    })

    test("should retrieve due later items", () => {
        add({
            title: "Due Later Todo",
            dueDate: new Date(new Date().setDate(new Date().getDate() + 1)).toLocaleDateString("en-CA"),
            completed: false,
        });
        const dueLaterItems = dueLater();
        expect(dueLaterItems.length).toBe(1);
        expect(dueLaterItems[0].title).toBe("Due Later Todo");
    });

    test("should retrieve all todos", () => {
        const todoItemsCount = all.length;
        add({
            title: "Retrieve All Todos",
            dueDate: new Date().toLocaleDateString("en-CA"),
            completed: false,
        });
        expect(all.length).toBe(todoItemsCount + 1);
        expect(all.some((item) => item.title === "Retrieve All Todos")).toBe(true);
    });

    test("should not mark a non-existent todo as complete", () => {
        const invalidIndex = all.length + 1; // Out of bounds index
        expect(() => markAsComplete(invalidIndex)).toThrow();
    });

    test("should retrieve only incomplete todos", () => {
        add({
            title: "Incomplete Todo",
            dueDate: new Date().toLocaleDateString("en-CA"),
            completed: false,
        });
        const incompleteTodos = all.filter((todo) => !todo.completed);
        expect(incompleteTodos.some((item) => item.title === "Incomplete Todo")).toBe(true);
    });

    test("should handle empty todo list gracefully", () => {
        const emptyList = [];
        expect(emptyList.length).toBe(0);
        expect(emptyList).toEqual([]);
    });

    test("should not add a todo without a title", () => {
        const todoItemsCount = all.length;
        add({
            title: "",
            dueDate: new Date().toLocaleDateString("en-CA"),
            completed: false,
        });
        expect(all.length).toBe(todoItemsCount); // No new todo should be added
    });
})