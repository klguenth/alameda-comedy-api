module.exports = {
    PORT: process.env.PORT || 8000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    DATABASE_URL: process.env.DATABASE_URL || 'postgresql://alamedacomedy@localhost/alamedacomedy',
    TEST_DATABASE_URL: process.env.TEST_DATABASE_URL || 'postgresql://alamedacomedy@localhost/alamedacomedy-test',
    API_ENDPOINT: 'postgres://svtfypugzisldb:f74c557b14c363a93883c789e1eb37190a6b6d37298a0de2a490300584b7cee0@ec2-34-200-72-77.compute-1.amazonaws.com:5432/d6fbg1us6r78ra'
  }