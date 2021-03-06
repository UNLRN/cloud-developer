export const config = {
  "username": process.env.POSTGRESQL_USERNAME,
  "password": process.env.POSTGRESQL_PASSWORD,
  "database": process.env.POSTGRESQL_DATABASE,
  "host": process.env.POSTGRESQL_HOST,
  "dialect": "postgres",
  "aws_region": process.env.AWS_REGION,
  "aws_profile": process.env.AWS_PROFILE,
  "aws_media_bucket": process.env.AWS_BUCKET,
  "jwt_secret": process.env.JWT_SECRET
}
