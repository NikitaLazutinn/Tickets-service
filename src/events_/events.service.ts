import { ImgurService } from './../imgur/imgur.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateEventDto, UpdateEventDto } from './dto/create-event.dto';

@Injectable()
export class EventsService {
  constructor(
    private readonly prisma: PrismaService,
    //private readonly companiesService: CompaniesService,
    private readonly imgurService: ImgurService,
  ) {}

  async create(token_data, createEventDto: CreateEventDto) {
    console.log(token_data);
    if (token_data['roleId'] === 3) {
      throw new NotFoundException();
    }

    const data = {
      title: createEventDto.title,
      description: createEventDto.description,
      location: createEventDto.location,
      date: new Date(createEventDto.date),
      creatorId: token_data['userId'],
      companyId: 0, //this.companiesService.findByPerson(token_data['userId']).Id,
      posterUrl: '-',
      deleteHashUrl: '-',
      notificationEnabled: createEventDto.notificationEnabled
        ? createEventDto.notificationEnabled
        : false,
      isVisitorListPublic: createEventDto.isVisitorListPublic
        ? createEventDto.isVisitorListPublic
        : false,
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

  async updateImage(eventId, file, token_data) {
    const event = await this.findById(eventId);
    if (event === null) {
      throw new NotFoundException();
    }
    const userId = token_data['userId'];
    if (userId !== event.creatorId) {
      throw new NotFoundException();
    }

    if (event.posterUrl !== event.deleteHashUrl) {
      await this.imgurService.deleteImageFromImgur(event.deleteHashUrl);
    }

    const { link: imageUrl, deletehash } =
      await this.imgurService.uploadToImgur(file);
    await this.prisma.event.update({
      where: { id: eventId },
      data: { posterUrl: imageUrl, deleteHashUrl: deletehash },
    });

    return { message: 'Post image updated successfully!' };
  }

  async findAll() {
    return await this.prisma.event.findMany();
  }

  async findOne(id: number) {
    const event = await this.prisma.event.findUnique({
      where: { id },
    });
    if (!event) throw new NotFoundException(`Event with ID ${id} not found`);
    return event;
  }

  async findById(id: number) {
    const event = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!event) throw new NotFoundException(`Event with ID ${id} not found`);
    return event;
  }

  async update(id: number, updateEventDto: UpdateEventDto, token_data) {
    const event = await this.findById(id);
    if (event === null) {
      throw new NotFoundException();
    }
    const userId = token_data['userId'];
    if (userId !== event.creatorId) {
      throw new NotFoundException();
    }

    const data = {
      title: updateEventDto.title,
      description: updateEventDto.description,
      location: updateEventDto.location,
      date: new Date(updateEventDto.date),
    };
    updateEventDto.notificationEnabled
      ? (data['notificationEnabled'] = updateEventDto.notificationEnabled)
      : 0;
    updateEventDto.isVisitorListPublic
      ? (data['isVisitorListPublic'] = updateEventDto.isVisitorListPublic)
      : 0;
    return await this.prisma.event.update({
      where: { id },
      data: data,
    });
  }

  async remove(id: number, token_data) {
    await this.deleteImage(id, token_data);
    await this.prisma.event.delete({
      where: { id },
    });

    return {
      statusCode: 204,
      message: 'Event deleted successfully',
    };
  }

  async deleteImage(id: number, token_data) {

    const event = await this.findById(id);
    if (event === null) {
      throw new NotFoundException();
    }
    const userId = token_data['userId'];
    if (userId !== event.creatorId) {
      throw new NotFoundException();
    }

    if (event.posterUrl !== event.deleteHashUrl) {
      await this.imgurService.deleteImageFromImgur(event.deleteHashUrl);
    }

    await this.prisma.event.update({
      where: { id },
      data: {deleteHashUrl: '-', posterUrl: '-'},
    });

    return {
      statusCode: 204,
      message: 'Image deleted successfully'
    };
  }
}
