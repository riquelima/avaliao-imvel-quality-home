import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { avaliacoesImoveis } from '@/db/schema';
import { eq, like, or, desc } from 'drizzle-orm';

// Updated WhatsApp validation regex for Brazilian format: (xx) xxxxxxxxx or (xx) xxxxx-xxxx
const whatsappRegex = /^\(\d{2}\)\s\d{4,5}-?\d{4}$/;

function validateWhatsapp(whatsapp: string | null | undefined): boolean {
  if (!whatsapp || whatsapp.trim() === '') return true; // Allow null/empty
  return whatsappRegex.test(whatsapp.trim());
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single record fetch
    if (id) {
      if (isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const record = await db.select()
        .from(avaliacoesImoveis)
        .where(eq(avaliacoesImoveis.id, parseInt(id)))
        .limit(1);

      if (record.length === 0) {
        return NextResponse.json({ 
          error: 'Record not found' 
        }, { status: 404 });
      }

      return NextResponse.json(record[0]);
    }

    // List records with pagination and search
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');

    let query = db.select().from(avaliacoesImoveis);
    
    if (search) {
      query = query.where(
        or(
          like(avaliacoesImoveis.avaliacao, `%${search}%`),
          like(avaliacoesImoveis.whatsapp, `%${search}%`)
        )
      );
    }

    const results = await query
      .orderBy(desc(avaliacoesImoveis.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results);

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imovelId, avaliadorId, avaliacao, whatsapp } = body;

    // Validate required fields
    if (!imovelId) {
      return NextResponse.json({ 
        error: "imovelId is required",
        code: "MISSING_IMOVEL_ID" 
      }, { status: 400 });
    }

    if (!avaliadorId) {
      return NextResponse.json({ 
        error: "avaliadorId is required",
        code: "MISSING_AVALIADOR_ID" 
      }, { status: 400 });
    }

    if (!avaliacao || avaliacao.trim() === '') {
      return NextResponse.json({ 
        error: "avaliacao is required",
        code: "MISSING_AVALIACAO" 
      }, { status: 400 });
    }

    // Validate WhatsApp format if provided
    const sanitizedWhatsapp = whatsapp?.trim() || null;
    if (sanitizedWhatsapp && !validateWhatsapp(sanitizedWhatsapp)) {
      return NextResponse.json({ 
        error: "Invalid WhatsApp format. Expected: (xx) xxxxxxxxx",
        code: "INVALID_WHATSAPP_FORMAT" 
      }, { status: 400 });
    }

    const newRecord = await db.insert(avaliacoesImoveis)
      .values({
        imovelId: parseInt(imovelId),
        avaliadorId: parseInt(avaliadorId),
        avaliacao: avaliacao.trim(),
        whatsapp: sanitizedWhatsapp,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json(newRecord[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if record exists
    const existingRecord = await db.select()
      .from(avaliacoesImoveis)
      .where(eq(avaliacoesImoveis.id, parseInt(id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json({ 
        error: 'Record not found' 
      }, { status: 404 });
    }

    const body = await request.json();
    const { imovelId, avaliadorId, avaliacao, whatsapp } = body;

    const updates: any = {
      updatedAt: new Date().toISOString()
    };

    // Validate and add fields if provided
    if (imovelId !== undefined) {
      if (!imovelId) {
        return NextResponse.json({ 
          error: "imovelId cannot be empty",
          code: "INVALID_IMOVEL_ID" 
        }, { status: 400 });
      }
      updates.imovelId = parseInt(imovelId);
    }

    if (avaliadorId !== undefined) {
      if (!avaliadorId) {
        return NextResponse.json({ 
          error: "avaliadorId cannot be empty",
          code: "INVALID_AVALIADOR_ID" 
        }, { status: 400 });
      }
      updates.avaliadorId = parseInt(avaliadorId);
    }

    if (avaliacao !== undefined) {
      if (!avaliacao || avaliacao.trim() === '') {
        return NextResponse.json({ 
          error: "avaliacao cannot be empty",
          code: "INVALID_AVALIACAO" 
        }, { status: 400 });
      }
      updates.avaliacao = avaliacao.trim();
    }

    if (whatsapp !== undefined) {
      const sanitizedWhatsapp = whatsapp?.trim() || null;
      if (sanitizedWhatsapp && !validateWhatsapp(sanitizedWhatsapp)) {
        return NextResponse.json({ 
          error: "Invalid WhatsApp format. Expected: (xx) xxxxxxxxx",
          code: "INVALID_WHATSAPP_FORMAT" 
        }, { status: 400 });
      }
      updates.whatsapp = sanitizedWhatsapp;
    }

    const updated = await db.update(avaliacoesImoveis)
      .set(updates)
      .where(eq(avaliacoesImoveis.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0]);

  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if record exists
    const existingRecord = await db.select()
      .from(avaliacoesImoveis)
      .where(eq(avaliacoesImoveis.id, parseInt(id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json({ 
        error: 'Record not found' 
      }, { status: 404 });
    }

    const deleted = await db.delete(avaliacoesImoveis)
      .where(eq(avaliacoesImoveis.id, parseInt(id)))
      .returning();

    return NextResponse.json({
      message: 'Record deleted successfully',
      deletedRecord: deleted[0]
    });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}