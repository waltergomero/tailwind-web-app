import bcryptjs from "bcryptjs";

const salt = bcryptjs.genSaltSync(12)
const hashedPassword = bcryptjs.hashSync('C#luisa1961', salt)

const sampleData = {
  users: [
    {
      first_name: 'Walter',
      last_name: 'Gomero',
      email: 'walter.gomero@gmail.com',
      password: hashedPassword,
      isadmin: true,
    },
    {
      first_name: 'Luisa',
      last_name: 'Gomero',
      email: 'luisa.gomero@gmail.com',
      password: hashedPassword,
      isadmin: false,
    },
  ],
};

export default sampleData;
