export default async function CustomerGet() {
  try {
    return {
      meta: {
        status: 'ERROR',
        message: 'Customer not found',
      },
      data: [
        {
          name: 'some name',
        },
      ],
    }
  } catch (error) {
    return {
      meta: {
        status: 'ERROR',
        message: 'Customer not found',
      },
      data: [],
    }
  }
}
