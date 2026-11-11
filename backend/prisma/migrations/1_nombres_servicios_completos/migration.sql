-- Nombres completos para que no haya dos "Tradicional" ni dos "Semipermanente".
-- Solo cambia los nombres originales; si Claudia ya los renombró, no los toca.
UPDATE "servicios" SET "nombre" = 'Manicure tradicional'         WHERE "categoria" = 'Manicure'   AND "nombre" = 'Tradicional';
UPDATE "servicios" SET "nombre" = 'Manicure semipermanente'      WHERE "categoria" = 'Manicure'   AND "nombre" = 'Semipermanente';
UPDATE "servicios" SET "nombre" = 'Uñas en softgel'              WHERE "categoria" = 'Manicure'   AND "nombre" = 'Softgel';
UPDATE "servicios" SET "nombre" = 'Uñas en dipping'              WHERE "categoria" = 'Manicure'   AND "nombre" = 'Dipping';
UPDATE "servicios" SET "nombre" = 'Pedicure tradicional'         WHERE "categoria" = 'Pedicure'   AND "nombre" = 'Tradicional';
UPDATE "servicios" SET "nombre" = 'Pedicure semipermanente'      WHERE "categoria" = 'Pedicure'   AND "nombre" = 'Semipermanente';
UPDATE "servicios" SET "nombre" = 'Depilación de cejas y bigote' WHERE "categoria" = 'Depilación' AND "nombre" IN ('Cejas y bigote', 'Cejas y Bigote');
UPDATE "servicios" SET "nombre" = 'Depilación de axilas'         WHERE "categoria" = 'Depilación' AND "nombre" = 'Axilas';
UPDATE "servicios" SET "nombre" = 'Depilación de bikini'         WHERE "categoria" = 'Depilación' AND "nombre" = 'Bikini';
UPDATE "servicios" SET "nombre" = 'Depilación de piernas'        WHERE "categoria" = 'Depilación' AND "nombre" IN ('Pierna completa', 'Pierna Completa');
UPDATE "servicios" SET "nombre" = 'Depilación completa'          WHERE "categoria" = 'Depilación' AND "nombre" = 'Completa';
