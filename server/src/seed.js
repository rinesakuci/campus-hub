const { prisma } = require("./db/prisma");

async function run() {
    await prisma.course.createMany({
        data: [
            { name: "Web Development", code: "WD101", description: "Basics of web" },
            { name: "Databases", code: "DB201", description: "Relational & NoSQL" }
        ]
    });
}

run().then(() => {
    console.log("Seeded");
    process.exit(0);
});