import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { RowDataPacket } from 'mysql2';

type Item = {
  id_comix: string;
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

    const [rows] = await connection.execute<(RowDataPacket & Item)[]>(
      'SELECT id_comix, dis_comix FROM tbl_comix'
    );

    await connection.end();

    return NextResponse.json(rows);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'An unknown error occurred.' }, { status: 500 });
  }
}
