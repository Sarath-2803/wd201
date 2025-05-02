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
})