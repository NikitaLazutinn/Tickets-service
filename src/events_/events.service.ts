import { ImgurService } from './../imgur/imgur.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateEventDto, UpdateEventDto } from './dto/create-event.dto';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService, 
    //private readonly companiesService: CompaniesService,
    private readonly imgurService: ImgurService
) {}

  async create(createEventDto: CreateEventDto, file, token_data) {

    if (token_data['roleId'] === 3) {
        throw new NotFoundException();
    }

    const url = await this.imgurService.addEventPoster(file);

    const data = {
      title: createEventDto.title,
      description: createEventDto.description,
      location: createEventDto.location,
      date: createEventDto.date,
      creatorId: token_data['userId'],
      companyId: 0, //this.companiesService.findByPerson(token_data['userId']).Id,
      posterUrl: url.imageUrl,
      deleteHashUrl: url.deletehash,
      isVisitorListPublic: createEventDto.isVisitorListPublic,
    };

    const event = await this.prisma.event.create({
      data: data,
    });

    return {
      statusCode: 201,
      message: 'Event created successfully',
      properties: event,
    };
  }

  async findAll() {
    return this.prisma.event.findMany()
  }

  async findOne(id: number) {
    const event = await this.prisma.event.findUnique({
      where: { id }
    });
    if (!event) throw new NotFoundException(`Event with ID ${id} not found`);
    return event;
  }

  async findById(id: number) {
    const event = await this.prisma.event.findUnique({
      where: { id }
    });

    if (!event) throw new NotFoundException(`Event with ID ${id} not found`);
    return event;
  }

  async update(id: number, updateEventDto: UpdateEventDto) {
    return this.prisma.event.update({
      where: { id },
      data: updateEventDto,
    });
  }

  async remove(id: number) {
    return this.prisma.event.delete({
      where: { id },
    });
  }
}
