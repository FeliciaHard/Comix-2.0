import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

type Strippy = {
  id_model_album: string;
  id_model: string;
  filename: string;
  cover_page: string;
};

const pool = mysql.createPool({
  host: process.env.MYSQL_HOSTNAME,
  user: process.env.MYSQL_USERNAME,
  password: process.env.MYSQL_PWD,
  database: process.env.MYSQL_DBNAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const [rows] = await pool.execute(
        'SELECT id_model_album, id_model, filename FROM tbl_model_album WHERE id_model = ?',
        [id]
      );
      return NextResponse.json({ data: rows as Strippy[] });
    } 
    // else {
    //   const [rows] = await pool.execute(
    //     'SELECT id_comix, name_comix, dis_comix FROM tbl_comix'
    //   );

    //   const [countResult] = await pool.execute(
    //     'SELECT COUNT(id_comix) AS total_comix FROM tbl_comix'
    //   );
    //   const [userCountResult] = await pool.execute(
    //     'SELECT COUNT(id) AS total_users FROM tbl_user'
    //   );

    //   const totalCount = (countResult as { total_comix: number }[])[0].total_comix;
    //   const totalUsers = (userCountResult as { total_users: number }[])[0].total_users;

    //   return NextResponse.json({
    //     total_comix: totalCount,
    //     total_users: totalUsers,
    //     data: rows as StrippyPage[],
    //   });
    // }
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'An unknown error occurred.' }, { status: 500 });
  }
}
