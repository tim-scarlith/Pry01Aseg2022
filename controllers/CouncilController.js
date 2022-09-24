const db = require('../../database/models');
const { Op } = require('sequelize');

class CouncilController {

  static async getCouncils(req, res) {
    try {
      await db.sequelize.transaction(async t => {
        const councils = await db.Consejo.findAll({ where: { fecha: { [Op.gte]: Date.now() } }, order: ['fecha', 'hora', 'consecutivo'] });
        if (councils.length > 0) {
          res.json({
            success: true,
            councils: councils
          });
        } else {
          res.json({
            success: false,
            msg: 'No se encontraron consejos.'
          });
        }
      });
    } catch (error) {
      res.status(500).json({
        msg: 'Error interno del servidor.'
      });
    }
  }

  static async getCouncilAttendant(req, res) {
    try {
      await db.sequelize.transaction(async t => {
        const council = await db.sequelize.query(`SELECT "Consejo"."institucion", "Consejo"."carrera", "Consejo"."campus", "Consejo"."nombre_consejo", "Consejo"."consecutivo", "Consejo"."lugar", "Consejo"."fecha", "Consejo"."hora", "Consejo"."id_tipo_sesion", "Convocado"."limite_solicitud" FROM public."Consejo" INNER JOIN public."Convocado" ON "Consejo"."consecutivo" = "Convocado"."consecutivo" WHERE "Convocado"."cedula" = '${req.params.cedula}' AND "Consejo"."consecutivo" = '${req.params.consecutivo}'`);
        if (council[0].length > 0) {
          res.json({
            success: true,
            council: council[0][0]
          });
        } else {
          res.json({
            success: false,
            msg: 'No se encontró el consejo.'
          });
        }
      });
    } catch (error) {
      res.status(500).json({
        msg: 'Error interno del servidor.'
      });
    }
  }

  static async getCouncilsByUser(req, res) {
    try {
      await db.sequelize.transaction(async t => {
        const councils = await db.sequelize.query(`SELECT "Consejo"."institucion", "Consejo"."carrera", "Consejo"."campus", "Consejo"."nombre_consejo", "Consejo"."consecutivo", "Consejo"."lugar", "Consejo"."fecha", "Consejo"."hora", "Consejo"."id_tipo_sesion" FROM public."Consejo" INNER JOIN public."Convocado" ON "Consejo"."consecutivo" = "Convocado"."consecutivo" WHERE "Convocado"."cedula" = '${req.params.cedula}' AND "Consejo"."fecha" >= '${req.params.fecha}' ORDER BY "Consejo"."fecha" ASC, "Consejo"."hora" ASC, "Consejo"."consecutivo" ASC`);
        if (councils[0].length > 0) {
          res.json({
            success: true,
            councils: councils[0]
          });
        } else {
          res.json({
            success: false,
            msg: 'No se encontraron consejos para esta cédula.'
          });
        }
      });
    } catch (error) {
      res.status(500).json({
        msg: 'Error interno del servidor.'
      });
    }
  }

  static async getCouncilsBefore(req, res) {
    try {
      await db.sequelize.transaction(async t => {
        const councils = await db.Consejo.findAll({ limit: 6, where: { fecha: { [Op.lt]: Date.now() } }, order: [['fecha', 'DESC'], ['hora', 'ASC'], ['consecutivo', 'ASC']] });
        if (councils.length > 0) {
          res.json({
            success: true,
            councils: councils
          });
        } else {
          res.json({
            success: false,
            msg: 'No se encontraron consejos.'
          });
        }
      });
    } catch (error) {
      res.status(500).json({
        msg: 'Error interno del servidor.'
      });
    }
  }

  static async getCouncilsBeforeByUser(req, res) {
    try {
      await db.sequelize.transaction(async t => {
        const councils = await db.sequelize.query(`SELECT "Consejo"."institucion", "Consejo"."carrera", "Consejo"."campus", "Consejo"."nombre_consejo", "Consejo"."consecutivo", "Consejo"."lugar", "Consejo"."fecha", "Consejo"."hora", "Consejo"."id_tipo_sesion" FROM public."Consejo" INNER JOIN public."Convocado" ON "Consejo"."consecutivo" = "Convocado"."consecutivo" WHERE "Convocado"."cedula" = '${req.params.cedula}' AND "Consejo"."fecha" < '${req.params.fecha}' ORDER BY "Consejo"."fecha" DESC, "Consejo"."hora" ASC, "Consejo"."consecutivo" ASC LIMIT 6`);
        if (councils[0].length > 0) {
          res.json({
            success: true,
            councils: councils[0]
          });
        } else {
          res.json({
            success: false,
            msg: 'No se encontraron consejos.'
          });
        }
      });
    } catch (error) {
      res.status(500).json({
        msg: 'Error interno del servidor.'
      });
    }
  }

  static async store(req, res) {
    const { consecutivo, id_tipo_sesion, fecha, hora, lugar, puntos, cedula, id_estado_punto } = req.body;
    try {
      await db.sequelize.transaction(async t => {
        await db.Consejo.create({
          consecutivo: consecutivo, id_tipo_sesion: id_tipo_sesion,
          fecha: fecha, hora: hora, lugar: lugar, editable: 1
        });
        for (let i = 0; i < puntos.length; i++) {
          await db.Punto.create({
            asunto: puntos[i].asunto, consecutivo: consecutivo, cedula: cedula, id_estado_punto: id_estado_punto,
            id_tipo_punto: puntos[i].id_tipo_punto, orden: i
          });
        }
        res.json({
          success: true
        });
      });
    } catch (error) {
      res.status(500).json({
        msg: 'Error interno del servidor.'
      });
    }
  }

  static async getCouncil(req, res) {
    try {
      await db.sequelize.transaction(async t => {
        const council = await db.Consejo.findOne({
          where: { consecutivo: req.params.consecutivo }
        });
        if (council) {
          res.json({
            success: true,
            council: council
          });
        } else {
          res.json({
            success: false,
            msg: 'No se encontró el consejo.'
          });
        }
      });
    } catch (error) {
      res.status(500).json({
        msg: 'Error interno del servidor.',
      });
    }
  }

  static async notEditable(req, res) {
    try {
      await db.sequelize.transaction(async t => {
        await db.Consejo.update({
          editable: 0
        }, { where: { consecutivo: req.params.consecutivo } });
        res.json({
          success: true
        });
      });
    } catch (error) {
      res.status(500).json({
        msg: 'Error interno del servidor.'
      });
    }
  }

  static async update(req, res) {
    const { id_tipo_sesion, fecha, hora, lugar } = req.body;
    try {
      await db.sequelize.transaction(async t => {
        await db.Consejo.update({
          id_tipo_sesion: id_tipo_sesion, lugar: lugar,
          fecha: fecha, hora: hora
        }, { where: { consecutivo: req.params.consecutivo } });
        res.json({
          success: true
        });
      });
    } catch (error) {
      res.status(500).json({
        msg: 'Error interno del servidor.'
      });
    }
  }

  static async remove(req, res) {
    try {
      await db.sequelize.transaction(async t => {
        await db.Consejo.destroy({ where: { consecutivo: req.params.consecutivo } });
        res.json({
          success: true
        });
      });
    } catch (error) {
      res.status(500).json({
        msg: 'Error interno del servidor.'
      });
    }
  }
}

module.exports = CouncilController;