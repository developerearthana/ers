const bcrypt = require('bcryptjs');

async function test() {
    console.log('Testing normal hash...');
    const t0 = Date.now();
    await bcrypt.compare('password123', '$2b$10$aBcDeFgHiJkLmNoPqRsTu.e1234567890123456789012345678901'); // 60 chars
    console.log(`Normal done in ${Date.now() - t0}ms`);

    console.log('Testing super-admin hash...');
    const t1 = Date.now();
    try {
        await bcrypt.compare('password123', '$2b$10$9s0QjN7nOgPdEaTEGvnOw.ii7mVsHZWlinJKSxhJ7gMDy3zdAhVDt6'); // 61 chars
    } catch(e) {
        console.log('Exception caught!', e.message);
    }
    console.log(`Super-admin hash done in ${Date.now() - t1}ms`);
}

test();
