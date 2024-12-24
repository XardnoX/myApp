const admin = require('firebase-admin');
const serviceAccount = require('./pokladna-b4647-firebase-adminsdk-xtdtd-14fecbf255.json'); // Update the path


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://pokladna-b4647-default-rtdb.firebaseio.com"
});

const db = admin.firestore();

async function importData() {
  try {
    // Import notifications
    const notifications = [
      { class: '2021B', title: null },
      { class: '2021C', title: null },
      { class: '2021A', title: null }
    ];
    for (const [index, notification] of notifications.entries()) {
      await db.collection('notification').doc((index + 1).toString()).set(notification);
    }
    console.log('Notifications imported successfully');

    // Import roles
    const roles = [
      { name: 'user' },
      { name: 'classteacher' }
    ];
    for (const [index, role] of roles.entries()) {
      await db.collection('role').doc((index + 1).toString()).set(role);
    }
    console.log('Roles imported successfully');

    // Import users
    const users = [
      { email: 'krajan_ondrej@oauh.cz', name: null, class: '2021B', credit: null },
      { email: 'v_krajanova@utb.cz', name: null, class: '2021C', credit: null },
      { email: 'kraj.verca@gmail.com', name: '', class: '2021B', credit: null },
      { email: 'skibidi_tomas@oauh.cz', name: null, class: '2021C', credit: null }
    ];
    for (const [index, user] of users.entries()) {
      await db.collection('user').doc((index + 2).toString()).set(user);
    }
    console.log('Users imported successfully');

    // Import widgets
    const widgets = [
      { name: 'Isic', class: '2021B', description: null, price: 200, full_paid: null, notification_id: db.doc('notification/1'), start: null, end: null },
      { name: 'ABCD', class: '2021C', description: 'asdfasdfasfd', price: 111, full_paid: null, notification_id: db.doc('notification/2'), start: null, end: null },
      { name: 'školní akce', class: '2021B', description: 'Divadelní představení', price: 155, full_paid: null, notification_id: db.doc('notification/1'), start: null, end: null }
    ];
    for (const [index, widget] of widgets.entries()) {
      await db.collection('widget').doc((index + 2).toString()).set(widget);
    }
    console.log('Widgets imported successfully');

    // Import role_has_user
    const roleHasUsers = [
      { role_id: db.doc('role/1'), user_id: db.doc('user/2') },
      { role_id: db.doc('role/2'), user_id: db.doc('user/3') }
    ];
    for (const roleHasUser of roleHasUsers) {
      await db.collection('role_has_user').add(roleHasUser);
    }
    console.log('Role-User relationships imported successfully');

    // Import user_has_widget
    const userHasWidgets = [
      { user_id: db.doc('user/2'), widget_id: db.doc('widget/2'), paid: true, owe: null },
      { user_id: db.doc('user/2'), widget_id: db.doc('widget/4'), paid: false, owe: null },
      { user_id: db.doc('user/3'), widget_id: db.doc('widget/3'), paid: false, owe: true },
      { user_id: db.doc('user/4'), widget_id: db.doc('widget/2'), paid: false, owe: true },
      { user_id: db.doc('user/4'), widget_id: db.doc('widget/4'), paid: true, owe: null }
    ];
    for (const userHasWidget of userHasWidgets) {
      await db.collection('user_has_widget').add(userHasWidget);
    }
    console.log('User-Widget relationships imported successfully');

  } catch (error) {
    console.error('Error importing data:', error);
  }
}

importData().catch(console.error);