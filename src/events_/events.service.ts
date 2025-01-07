import { ImgurService } from './../imgur/imgur.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateEventDto, UpdateEventDto } from './dto/create-event.dto';
import { CompaniesService } from 'src/companies/companies.service';
import axios from 'axios';

@Injectable()
export class EventsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly companiesService: CompaniesService,
    private readonly imgurService: ImgurService,
  ) {}

  async getCoordinates(
    location: string,
  ): Promise<{ latitude: number; longitude: number }> {
    const apiKey = process.env.LOCATION_IQ_API_KEY;
    const url = `https://us1.locationiq.com/v1/search.php?key=${apiKey}&q=${encodeURIComponent(location)}&format=json`;

    const response = await axios.get(url);
    const data = response.data[0];

    return {
      latitude: parseFloat(data.lat),
      longitude: parseFloat(data.lon),
    };
  }

  async create(token_data, createEventDto: CreateEventDto) {
    if (token_data['roleId'] === 3) {
      throw new NotFoundException();
    }

    let latitude;
    let longitude;
    if (createEventDto.latitude && createEventDto.longitude) {
      latitude = createEventDto.latitude;
      longitude = createEventDto.longitude;
    } else {
      const coordinates = await this.getCoordinates(createEventDto.location);
      latitude = coordinates.latitude;
      longitude = coordinates.longitude;
    }

    const data = {
      title: createEventDto.title,
      description: createEventDto.description,
      location: createEventDto.location,
      latitude: latitude,
      longitude: longitude,
      date: new Date(createEventDto.date),
      creatorId: token_data['userId'],
      companyId: createEventDto.companyId,
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
      data: { deleteHashUrl: '-', posterUrl: '-' },
    });

    return {
      statusCode: 204,
      message: 'Image deleted successfully',
    };
  }

  async isEventCreator(userId: number, eventId: number): Promise<boolean> {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });
    return event?.creatorId === userId;
  }

  async findEventsWithRatings() {
    const events = await this.prisma.event.findMany({
      include: { ratings: true },
    });
    return events;
  }
  async findOneEventWithRatings(eventId: number) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        ratings: true,
      },
    });
    return event;
  }

  async updateEventAverageRating(eventId: number, averageRating: number) {
    await this.prisma.event.update({
      where: { id: eventId },
      data: { averageRating },
    });
  }
}
