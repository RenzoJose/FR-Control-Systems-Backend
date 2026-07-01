## Jest Configuration Notes

forceExit is enabled because Prisma with Neon adapter
may keep database pool connections open after E2E execution.

Con "forceExit": true Jest cierra el proceso ni bien terminan los tests, sin esperar a que Prisma cierre el pool de conexiones. Es la práctica estándar con Prisma + Jest.