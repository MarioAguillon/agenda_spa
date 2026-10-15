import { clientesRepository } from '../repositories/clientes.repository';
import { negociosRepository } from '../repositories/negocios.repository';
import { AppError } from '../middlewares/error.middleware';
import { CreateClienteInput } from '../schemas/cliente.schema';

export class ClientesService {
  async getClientes(search?: string) {
    const negocio = await negociosRepository.getFirstNegocio();
    if (!negocio) {
      throw new AppError('Negocio no encontrado', 404);
    }
    return clientesRepository.findAll(negocio.id, search);
  }

  async getClienteById(id: string) {
    const cliente = await clientesRepository.findById(id);
    if (!cliente) {
      throw new AppError('Cliente no encontrado', 404);
    }
    return cliente;
  }

  async createCliente(input: CreateClienteInput) {
    const negocio = await negociosRepository.getFirstNegocio();
    if (!negocio) {
      throw new AppError('Negocio no encontrado', 404);
    }
    return clientesRepository.upsertByTelefono(negocio.id, input);
  }
}

export const clientesService = new ClientesService();
