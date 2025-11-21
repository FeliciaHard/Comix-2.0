import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { RowDataPacket } from 'mysql2';

// Define the type for each comic record
type Dash = {
  id_comix: string;
  name_comix: string;
  dis_comix: string;
};

export async function GET() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOSTNAME,
      user: process.env.MYSQL_USERNAME,
      password: process.env.MYSQL_PWD,
      database: process.env.MYSQL_DBNAME,
    });

    const [rows] = await connection.execute<(RowDataPacket & Dash)[]>(
      'SELECT id_comix, name_comix, dis_comix FROM tbl_comix'
    );

    const [countResult] = await connection.execute<(RowDataPacket & { total_comix: number })[]>(
      'SELECT COUNT(id_comix) AS total_comix FROM tbl_comix'
    );

    const [userCountResult] = await connection.execute<(RowDataPacket & { total_users: number })[]>(
      'SELECT COUNT(id) AS total_users FROM tbl_user'
    );

    await connection.end();

    const totalCount = countResult[0].total_comix;
    const totalUsers = userCountResult[0].total_users;

    return NextResponse.json({
      total_comix: totalCount,
      total_users: totalUsers,
      data: rows,
    });

  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'An unknown error occurred.' }, { status: 500 });
  }
}
